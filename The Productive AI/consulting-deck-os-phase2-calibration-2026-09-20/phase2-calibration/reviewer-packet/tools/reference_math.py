"""Small reference-case calculator, not the product PPT compiler or a finance library."""
from datetime import date
from decimal import Decimal, localcontext
import math

def D(value):
    return Decimal(str(value))

def npv(rate, flows):
    with localcontext() as ctx:
        ctx.prec = 36
        r = D(rate)
        if r <= -1:
            raise ValueError('DISCOUNT_RATE_INVALID')
        return sum((D(v) / (1+r)**i for i,v in enumerate(flows)), D(0))

def times_from_dates(dates):
    ds = [date.fromisoformat(x) for x in dates]
    if not ds or any(x < ds[0] for x in ds):
        raise ValueError('CASHFLOW_DATES_INVALID')
    if ds != sorted(ds):
        raise ValueError('DATES_MUST_BE_ORDERED_FOR_REFERENCE_CASE')
    return [(x-ds[0]).days/365 for x in ds]

def xnpv(rate, flows, dates):
    if len(flows) != len(dates):
        raise ValueError('CASHFLOW_DATE_LENGTH_MISMATCH')
    r=float(rate)
    if r <= -1 or not math.isfinite(r):
        raise ValueError('DISCOUNT_RATE_INVALID')
    return math.fsum(float(c)/(1+r)**t for c,t in zip(flows,times_from_dates(dates)))

def conventional_root(flows, value_function):
    """Restricted to conventional negative-then-positive flows; guard ambiguous IRRs."""
    vals=[float(x) for x in flows if float(x)!=0]
    if not vals or not(any(x<0 for x in vals) and any(x>0 for x in vals)):
        raise ValueError('IRR_UNDEFINED_NO_SIGN_CHANGE')
    transitions=sum((a<0)!=(b<0) for a,b in zip(vals, vals[1:]))
    if transitions!=1 or vals[0]>=0:
        raise ValueError('IRR_NONCONVENTIONAL_REQUIRES_REVIEW')
    lo,hi=-0.99,1.0
    while value_function(hi)>0 and hi<1024:
        hi=2*hi+1
    if value_function(lo)*value_function(hi)>0:
        raise ValueError('IRR_NOT_BRACKETED')
    for _ in range(160):
        mid=(lo+hi)/2
        if value_function(mid)>0:
            lo=mid
        else:
            hi=mid
    return (lo+hi)/2

def irr(flows):
    return conventional_root(flows,lambda r:float(npv(r,flows)))

def xirr(flows,dates):
    return conventional_root(flows,lambda r:xnpv(r,flows,dates))

def cumulative(flows):
    result=[];s=D(0)
    for v in flows:
        s+=D(v);result.append(s)
    return result

def payback_period_end(flows):
    """First observed period-end with nonnegative cumulative cash, no interpolation."""
    return next((i for i,c in enumerate(cumulative(flows)) if i>0 and c>=0),None)

def c02_flows(mode,contribution_multiplier=1,opex_multiplier=1,initial_multiplier=1):
    initial=sum(D(mode[k]) for k in ('initial_setup','initial_capex_or_purchase','initial_working_capital'))
    cf=[-initial*D(initial_multiplier)]
    cf.extend(D(a)*D(contribution_multiplier)-D(b)*D(opex_multiplier) for a,b in zip(mode['annual_contribution'],mode['annual_opex']))
    cf[-1]+=D(mode['working_capital_recovery'])
    return cf

def c04_flows(case, scenario):
    i=case['initial'];m=D(scenario['capex_multiplier'])
    cf=[-(D(i['capex'])*m+D(i['implementation_cash'])+D(i['working_capital']))]
    for r in case['operating_years']:
        cf.append(D(r['cash_benefit'])*D(scenario['benefit_multiplier'])
                  -D(r['incremental_cash_opex'])*D(scenario['opex_multiplier'])
                  -D(r['maintenance_capex'])*m+D(r['working_capital_release'])+D(r['disposal_proceeds']))
    return cf

def c03_results(c):
    def month(r):
        rev=D(r['units'])*D(r['unit_price_idr'])/D(10**9)
        return {'revenue':rev,'ebit':rev-D(r['direct_cost'])-D(r['opex'])}
    b,a=c['monthly']['budget'],c['monthly']['actual']
    bm,am=month(b),month(a)
    bridge={
        'volume':(D(a['units'])-D(b['units']))*D(b['unit_price_idr'])/D(10**9),
        'price':D(a['units'])*(D(a['unit_price_idr'])-D(b['unit_price_idr']))/D(10**9),
        'direct_cost':D(b['direct_cost'])-D(a['direct_cost']),
        'opex':D(b['opex'])-D(a['opex'])}
    ytd={k:D(v['revenue'])-D(v['direct_cost'])-D(v['opex']) for k,v in c['ytd'].items() if k in ('budget','actual')}
    f=c['forecast'];pre=D(f['previous_ebit'])+sum(map(D,f['changes_before_actions'].values()),D(0))
    committed=sum((D(a['impact']) for a in c['actions'] if a['impact_type']=='FY_EBIT' and a['confidence']=='COMMITTED'),D(0))
    cash=c['cash'];closing=D(cash['opening'])+D(cash['customer_receipts'])-sum(D(cash[k]) for k in ('supplier_payments','staff_and_overhead_payments','capex_paid','loan_principal_repaid'))
    conditional=sum((D(a['impact']) for a in c['actions'] if a['impact_type']=='JULY_CASH_ONLY'),D(0))
    return {'monthly_budget':bm,'monthly_actual':am,'monthly_ebit_variance':am['ebit']-bm['ebit'],
            'ebit_bridge':bridge,'ytd_ebit':ytd,'forecast_before_actions':pre,
            'committed_ebit_actions':committed,'final_forecast_ebit':pre+committed,
            'implied_h2_ebit':pre+committed-ytd['actual'],'closing_cash':closing,
            'cash_gap_to_floor':closing-D(cash['minimum_cash']),
            'conditional_july_cash':D(cash['july_base_forecast_closing_cash'])+conditional}
