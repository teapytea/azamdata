"""Rebuild derived reference outputs from the original synthetic inputs."""
from pathlib import Path
from decimal import Decimal
import json
from reference_math import D,npv,irr,xnpv,xirr,c02_flows,c03_results,c04_flows,cumulative,payback_period_end

ROOT=Path(__file__).resolve().parents[1]

def read(name):
    return json.loads((ROOT/'cases'/name).read_text())

def encode(x):
    if isinstance(x,Decimal): return float(x)
    raise TypeError(type(x).__name__)

def write(name,x):
    (ROOT/'cases'/name).write_text(json.dumps(x,ensure_ascii=False,indent=2,default=encode)+'\n')

def build():
    c2=read('c02-market-entry.json'); c3=read('c03-performance-review.json'); c4=read('c04-investment-case.json')
    scores={m:sum(D(s[k])*D(w) for k,w in c2['market_weights'].items()) for m,s in c2['market_scores'].items()}
    modes=[];constraints=c2['decision_constraints']
    for m in c2['modes_for_market_b']:
        cf=c02_flows(m);d=c2['downside']
        down=c02_flows(m,d['annual_contribution_multiplier'],d['annual_opex_multiplier'],d['initial_cost_multiplier'])
        n=npv(c2['discount_rate'],cf);dn=npv(c2['discount_rate'],down)
        failures=[]
        if -cf[0]>D(constraints['max_initial_funding']):failures.append('INITIAL_FUNDING')
        if m['launch_months'] is not None and m['launch_months']>constraints['max_launch_months']:failures.append('LAUNCH_TIME')
        if n<D(constraints['min_base_npv']):failures.append('BASE_NPV')
        if dn<D(constraints['min_downside_npv']):failures.append('DOWNSIDE_NPV')
        modes.append(dict(mode=m['mode'],cashflows=cf,initial_funding=-cf[0],launch_months=m['launch_months'],npv=n,downside_npv=dn,
                          eligible=not failures,failed_constraints=failures,
                          irr=irr(cf) if any(cf) else None))
    chosen=max((m for m in modes if m['eligible']),key=lambda m:m['npv'])
    result2=dict(case_id='SYN-C02',data_status='SYNTHETIC_ORIGINAL',selected_market=max(scores,key=scores.get),market_scores=scores,modes=modes,
                 selected_mode=chosen['mode'],decision_status=c2['decision']['status'],decision_id=c2['decision']['decision_id'],
                 caveat='Selection remains conditional; no real approval or actual company result is asserted.')
    result3=dict(case_id='SYN-C03',data_status='SYNTHETIC_ORIGINAL',**c03_results(c3))
    scenarios=[]
    for s in c4['scenarios']:
        cf=c04_flows(c4,s)
        scenarios.append(dict(scenario_id=s['scenario_id'],cashflow_dates=c4['cashflow_dates'],cashflows=cf,cumulative_cash=cumulative(cf),
             initial_funding=-cf[0],annual_npv=npv(c4['discount_rate'],cf),annual_irr=irr(cf),
             xnpv=xnpv(c4['discount_rate'],cf,c4['cashflow_dates']),xirr=xirr(cf,c4['cashflow_dates']),
             observed_period_end_payback=payback_period_end(cf),peak_funding_required=-min(cumulative(cf))))
    base=scenarios[0];down=scenarios[-1]
    gates=dict(base_npv=base['xnpv']>=c4['decision']['min_base_xnpv'],base_return=base['xirr']>=c4['decision']['min_base_xirr'],
               base_funding=base['initial_funding']<=D(c4['decision']['base_funding_ceiling']),
               combined_downside_npv=down['xnpv']>=0,combined_downside_funding=down['initial_funding']<=D(c4['decision']['base_funding_ceiling']))
    result4=dict(case_id='SYN-C04',data_status='SYNTHETIC_ORIGINAL',scenarios=scenarios,gates=gates,
        recommendation='CONDITIONAL_BASE_CASE_ONLY; FULL_COMMITMENT_HELD_PENDING_DOWNSIDE_AND_COST_REAPPROVAL',
        decision_status=c4['decision']['status'],decision_id=c4['decision']['decision_id'])
    for name,x in [('c02-expected.json',result2),('c03-expected.json',result3),('c04-expected.json',result4)]:write(name,x)
    return result2,result3,result4

if __name__=='__main__':
    for x in build():print(json.dumps(x,ensure_ascii=False,indent=2,default=encode))
