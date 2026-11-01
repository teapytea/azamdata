"""Score supplied reviewer judgments. This does not review a deck by itself."""
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def score(review,config):
    earned=0.;available=0.;missing=[];dimensions={}
    for d in config['dimensions']:
        subtotal=0.;weight_rated=0.
        for c in d['criteria']:
            value=review.get('ratings',{}).get(c['id'])
            evidence=review.get('rating_evidence',{}).get(c['id'],[])
            if value is None or not evidence:
                missing.append(c['id']);continue
            if isinstance(value,bool) or not isinstance(value,(int,float)) or value not in config['rating_scale']:
                raise ValueError('INVALID_RATING:'+c['id'])
            subtotal+=c['weight']*value/4;weight_rated+=c['weight']
        dimensions[d['id']]={'points':subtotal,'reviewed_weight':weight_rated,'total_weight':d['weight']}
        earned+=subtotal;available+=weight_rated
    failures=[];unverified=[]
    for i in config['hard_fail_ids']:
        entry=review.get('hard_fail_checks',{}).get(i,{})
        status=entry.get('status','unverified')
        if status=='failed':failures.append(i)
        elif status in ('clear','not_applicable'):
            if not entry.get('evidence') or (status=='not_applicable' and not entry.get('reason')):unverified.append(i)
        elif status=='unverified':unverified.append(i)
        else:raise ValueError('INVALID_HARD_FAIL_STATUS:'+i)
    metadata_missing=[k for k in ('artifact_id','artifact_version','reviewer_id','review_date') if not review.get(k)]
    if failures:status='FAIL_HARD_CONDITION'
    elif missing or unverified or metadata_missing:status='INCOMPLETE'
    elif earned<config['pass_threshold']:status='REVISE'
    else:status='PASS'
    return dict(status=status,total_score_100=earned if not (missing or unverified or metadata_missing) else None,reviewed_points=earned,reviewed_maximum=available,
                dimensions=dimensions,missing_ratings_or_evidence=missing,failed_conditions=failures,
                unverified_conditions=unverified,missing_metadata=metadata_missing,
                scope='Aggregates supplied reviewer judgments; not proof that those judgments or cited evidence are correct.')

if __name__=='__main__':
    if len(sys.argv)!=2:raise SystemExit('Usage: python tools/score_review.py path/to/completed-review.json')
    config=json.loads((ROOT/'phase2/weighted-scorecard.json').read_text())
    print(json.dumps(score(json.loads(Path(sys.argv[1]).read_text()),config),ensure_ascii=False,indent=2))
