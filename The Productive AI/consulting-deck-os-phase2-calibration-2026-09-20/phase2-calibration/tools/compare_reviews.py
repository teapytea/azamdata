"""Compare two supplied reviews; never creates reviewer judgments.

Usage: python tools/compare_reviews.py review-a.json review-b.json
Run within the extracted full calibration package. Review independence is an
attestation, not something this program can establish from an ID alone.
"""
from pathlib import Path
from datetime import date
import json
import hashlib
import sys

ROOT = Path(__file__).resolve().parents[1]
CORE = [f'{p}{i}' for p, n in [('STR',5),('EVI',4),('MSG',3),('CHR',3),('VIS',3)] for i in range(1,n+1)]
SCOPED_HF = [f'HF{i:02}' for i in range(1,13) if i != 7]

def evidence_ok(value):
    return isinstance(value,list) and bool(value) and all(isinstance(x,str) and x.strip() for x in value)

def compare(a,b,config,expected):
    """Use frozen artifact/standard hashes, coverage, and criterion-level deltas."""
    errors=[]; disagreements=[]; pending=[]
    weights={c['id']:c['weight'] for d in config['dimensions'] for c in d['criteria']}
    for label,r in [('A',a),('B',b)]:
        if not r.get('reviewer_id'):errors.append(label+':MISSING_REVIEWER')
        try:date.fromisoformat(r.get('review_date',''))
        except (ValueError,TypeError):errors.append(label+':INVALID_REVIEW_DATE')
        for key in ['artifact_id','artifact_version','artifact_sha256','standard_version','standard_sha256','rubric_bundle_sha256']:
            if r.get(key)!=expected.get(key):errors.append(label+':MISMATCH_'+key)
        att=r.get('independence_attestation',{})
        if att.get('is_artifact_author') is not False or att.get('has_seen_other_review') is not False:
            errors.append(label+':INDEPENDENCE_NOT_ATTESTED')
        for cid in CORE:
            rating=r.get('ratings',{}).get(cid)
            if isinstance(rating,bool) or not isinstance(rating,int) or rating not in range(5):
                errors.append(label+':CORE_RATING_INVALID_'+cid)
            if not evidence_ok(r.get('rating_evidence',{}).get(cid)):
                errors.append(label+':EVIDENCE_MISSING_'+cid)
        for hid in config['hard_fail_ids']:
            v=r.get('hard_fail_checks',{}).get(hid,{})
            status=v.get('status')
            if status not in ['failed','clear','not_applicable','unverified']:
                errors.append(label+':INVALID_HF_STATUS_'+hid)
                continue
            if status=='unverified':
                pending.append(label+':'+hid)
                if hid in SCOPED_HF:errors.append(label+':SCOPED_HF_UNVERIFIED_'+hid)
            elif not evidence_ok(v.get('evidence')):
                errors.append(label+':HF_EVIDENCE_MISSING_'+hid)
            if status=='not_applicable' and not str(v.get('reason','')).strip():
                errors.append(label+':NA_REASON_MISSING_'+hid)
    if a.get('reviewer_id')==b.get('reviewer_id'):errors.append('REVIEWERS_MUST_BE_DISTINCT')
    if errors:
        return dict(status='INCOMPLETE_OR_INVALID',errors=errors,scope_points=None,product_pass=False,
                    note='No consistency conclusion. Distinct identities alone do not prove independent judgment.')
    deltas=[];points_a=0.;points_b=0.
    for cid in CORE:
        ra=a['ratings'][cid];rb=b['ratings'][cid];delta=abs(ra-rb)
        points_a+=weights[cid]*ra/4;points_b+=weights[cid]*rb/4
        deltas.append(dict(criterion=cid,a=ra,b=rb,absolute_rating_delta=delta))
    for hid in config['hard_fail_ids']:
        sa=a['hard_fail_checks'][hid]['status'];sb=b['hard_fail_checks'][hid]['status']
        if sa!=sb:disagreements.append(dict(hard_fail=hid,a=sa,b=sb))
    within=sum(d['absolute_rating_delta']<=1 for d in deltas)/len(deltas)
    total_gap=abs(points_a-points_b)
    tests=dict(raw_point_gap_at_most_5=total_gap<=5,
               at_least_90_percent_ratings_within_one=within>=.9,
               no_unresolved_hard_fail_disagreement=not disagreements)
    return dict(status='CONSISTENT_ON_REVIEWED_SCOPE' if all(tests.values()) else 'NEEDS_ADJUDICATION',
                reviewed_criteria=CORE,scope_maximum=sum(weights[c] for c in CORE),
                scope_points={'reviewer_a':points_a,'reviewer_b':points_b},absolute_point_gap=total_gap,
                fraction_within_one=within,criteria=deltas,threshold_checks=tests,
                hard_fail_disagreements=disagreements,deferred_checks=pending,
                product_pass=False,independence_basis='DECLARED_BY_REVIEWERS_NOT_PROVEN_BY_CODE',
                limitation='One pair on one development artifact. Three artifact pairs, adjudication, and a recorded Phase 2 gate decision are required; this does not validate a product or platform.')

if __name__=='__main__':
    if len(sys.argv)!=3:raise SystemExit(__doc__)
    a,b=[json.loads(Path(p).read_text()) for p in sys.argv[1:]]
    config=json.loads((ROOT/'reviewer-packet/phase2/weighted-scorecard.json').read_text())
    manifest=json.loads((ROOT/'reviewer-packet/artifact-manifest.json').read_text())
    expected=next((x for x in manifest['artifacts'] if x['artifact_id']==a.get('artifact_id')),None)
    if expected is None:raise SystemExit('Unknown artifact_id')
    packet=ROOT/'reviewer-packet'
    actual_deck_hash=hashlib.sha256((packet/expected['file']).read_bytes()).hexdigest()
    if actual_deck_hash!=expected['artifact_sha256']:raise SystemExit('Frozen PPTX bytes have changed')
    for name,expected_hash in manifest['rubric_file_hashes'].items():
        if hashlib.sha256((packet/'phase2'/name).read_bytes()).hexdigest()!=expected_hash:
            raise SystemExit('Frozen rubric bytes have changed: '+name)
    print(json.dumps(compare(a,b,config,expected),ensure_ascii=False,indent=2))
