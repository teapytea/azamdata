"""Software fixtures only. These are not real independent review results."""
import copy,json
from pathlib import Path
from compare_reviews import compare,CORE
ROOT=Path(__file__).resolve().parents[1]
config=json.loads((ROOT/'reviewer-packet/phase2/weighted-scorecard.json').read_text())
expected=dict(artifact_id='TEST_ONLY',artifact_version='test',artifact_sha256='TEST_HASH',standard_version='0.1',standard_sha256='TEST_STANDARD_HASH',rubric_bundle_sha256='TEST_RUBRIC_HASH')
def fixture(rid):
    return dict(**expected,reviewer_id=rid,review_date='2026-09-20',
      independence_attestation={'is_artifact_author':False,'has_seen_other_review':False},
      ratings={c:3 for c in CORE},rating_evidence={c:['TEST FIXTURE ONLY'] for c in CORE},
      hard_fail_checks={c:{'status':'unverified' if c=='HF07' else 'clear','evidence':['TEST FIXTURE ONLY'],'reason':''} for c in config['hard_fail_ids']})
checks=[]
def check(n,ok):checks.append(dict(id=n,passed=bool(ok)))
a,b=fixture('TEST_R1'),fixture('TEST_R2')
r=compare(a,b,config,expected)
check('consistent_partial_scope_not_product_pass',r['status']=='CONSISTENT_ON_REVIEWED_SCOPE' and r['scope_maximum']==90 and r['product_pass'] is False)
t=copy.deepcopy(b);t['reviewer_id']=a['reviewer_id']
check('same_reviewer_rejected',compare(a,t,config,expected)['status']=='INCOMPLETE_OR_INVALID')
t=copy.deepcopy(b);t['artifact_sha256']='OTHER'
check('artifact_hash_mismatch_rejected',compare(a,t,config,expected)['status']=='INCOMPLETE_OR_INVALID')
t=copy.deepcopy(b);t['standard_sha256']='OTHER'
check('standard_hash_mismatch_rejected',compare(a,t,config,expected)['status']=='INCOMPLETE_OR_INVALID')
t=copy.deepcopy(b);t['ratings']={'STR1':3}
check('sparse_coverage_not_promoted_to_agreement',compare(a,t,config,expected)['status']=='INCOMPLETE_OR_INVALID')
t=copy.deepcopy(b);t['rating_evidence']['EVI1']=[' ']
check('blank_evidence_rejected',compare(a,t,config,expected)['status']=='INCOMPLETE_OR_INVALID')
t=copy.deepcopy(b);t['hard_fail_checks']['HF02']['status']='failed'
check('hard_fail_disagreement_requires_adjudication',compare(a,t,config,expected)['status']=='NEEDS_ADJUDICATION')
t=copy.deepcopy(b);t['hard_fail_checks']['HF12']['status']='not_applicable'
check('not_applicable_requires_reason',compare(a,t,config,expected)['status']=='INCOMPLETE_OR_INVALID')
t=copy.deepcopy(b);t['independence_attestation']['has_seen_other_review']=True
check('contaminated_review_not_independent',compare(a,t,config,expected)['status']=='INCOMPLETE_OR_INVALID')
t=copy.deepcopy(b);t['ratings'].update(STR1=0,STR2=0,STR3=4,STR4=4,STR5=4,EVI1=4,EVI2=4,EVI3=4)
r=compare(a,t,config,expected)
check('offsetting_disagreements_not_hidden_by_equal_totals',r['absolute_point_gap']==0 and r['status']=='NEEDS_ADJUDICATION')
t=copy.deepcopy(b);t['hard_fail_checks']['HF01']['status']='unverified'
check('in_scope_unknown_blocks_conclusion',compare(a,t,config,expected)['status']=='INCOMPLETE_OR_INVALID')
report=dict(scope='Software unit fixtures, not human/AI reviews',checks=checks,total=len(checks),passed=sum(c['passed'] for c in checks),all_passed=all(c['passed'] for c in checks))
(ROOT/'operator/comparison-tool-tests.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='checks'}))
raise SystemExit(0 if report['all_passed'] else 1)
