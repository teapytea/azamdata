"""Freeze current reviewer inputs and make empty forms; no judgments generated."""
from pathlib import Path
import hashlib,json,shutil,zipfile
from xml.etree import ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
WORK=ROOT.parent
P=ROOT/'reviewer-packet'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text())
def write(p,obj):p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
standard_hash=sha(P/'phase2/consulting-grade-standard.md')
rule_files=sorted(p for p in (P/'phase2').glob('*') if p.is_file())
rule_hashes={p.name:sha(p) for p in rule_files}
bundle_hash=hashlib.sha256(json.dumps(rule_hashes,sort_keys=True).encode()).hexdigest()
artifacts=[];technical=[]
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
for letter in 'ABC':
    deck=P/'decks'/f'calibration-{letter}-v2.pptx'
    artifact=dict(artifact_id='CAL-'+letter,artifact_version='2026-09-20.v2',
                  artifact_sha256=sha(deck),file='decks/'+deck.name,standard_version='0.1',
                  standard_sha256=standard_hash,rubric_bundle_sha256=bundle_hash,slide_count=4,
                  source_case={'A':'SYN-C02','B':'SYN-C03','C':'SYN-C04'}[letter])
    artifacts.append(artifact)
    form=read(P/'phase2/review-template.json')
    form.update({k:v for k,v in artifact.items() if k not in ['file','slide_count','source_case']})
    form.update(reviewer_type=None,reviewer_model_or_role=None,review_environment=None,
                independence_attestation={'is_artifact_author':None,'has_seen_other_review':None},
                findings=[],review_note='Blank form. No actual review or rating has been recorded.')
    write(P/'reviews'/f'review-CAL-{letter}.json',form)
    with zipfile.ZipFile(deck) as z:
        slides=[n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml') and '/_rels/' not in n]
        roots=[ET.fromstring(z.read(n)) for n in slides]
        chart_parts=[n for n in z.namelist() if '/charts/' in n and n.endswith('.xml') and '/_rels/' not in n]
        workbook_parts=[n for n in z.namelist() if n.startswith('ppt/embeddings/') and n.endswith('.xlsx')]
        stats=dict(slides=len(slides),native_tables=sum(len(s.findall('.//a:tbl',ns)) for s in roots),
                   native_chart_parts=len(chart_parts),embedded_workbooks=len(workbook_parts),
                   raster_pictures=sum(len(s.findall('.//p:pic',ns)) for s in roots))
    report=read(WORK/'validation'/f'calibration-{letter}-v2.validation.json')
    assert report['finalSha256']==artifact['artifact_sha256']
    technical.append(dict(artifact_id=artifact['artifact_id'],sha256=artifact['artifact_sha256'],
      object_inventory=stats,structural_integrity=report['packageIntegrity']['status'],
      layout_findings=report['presentationLayout']['finding_count'],layout_warnings=report['presentationLayout']['warning_count'],
      artifact_tool_import=report['firstPartyImport']['passed'],
      native_chart_workbook_validation=report['nativeChartValidation']['passed'],
      chart_data_basis='Literal data snapshots; no spreadsheet calculation formulas claimed',
      preview_renderer='Artifact Tool import of final PPTX',
      powerpoint_open_edit_save_reopen='NOT_TESTED',google_slides_import='NOT_TESTED',
      ai_adapter_compatibility='NOT_TESTED',
      note='Structure/render evidence only. Does not adjudicate content correctness or assign a rubric score.'))
manifest=dict(freeze_date='2026-09-20',standard_version='0.1',standard_sha256=standard_hash,
              rubric_bundle_sha256=bundle_hash,rubric_file_hashes=rule_hashes,artifacts=artifacts,
              dataset_use='Development pilot; neither blind holdout nor production gold',
              case_hashes={p.name:sha(p) for p in sorted((P/'cases').glob('*.json'))})
write(P/'artifact-manifest.json',manifest)
write(P/'technical-evidence.json',{'scope':'Bounded structural/renderer checks; no content quality rating','artifacts':technical})
write(ROOT/'checkpoint-2026-09-20.json',dict(
 date='2026-09-20',project='Productive AI / Consulting Deck OS',
 predecessor='checkpoint-2026-09-18.json',phase1='COMPLETE_FOR_STANDARD_WITH_DOCUMENTED_LIMITS',
 phase2='IN_PROGRESS_INDEPENDENT_REVIEWS_PENDING',standard_version='0.1_FROZEN_UNCHANGED',
 current_work='CALIBRATION_PACKET_READY',decks=3,slides=12,original_case_families=3,
 reviewer_forms=3,completed_independent_reviews=0,
 reviewer_agreement='NOT_MEASURED',author_diagnostic='AVAILABLE_NOT_INDEPENDENT',
 powerpoint_application_qa='NOT_RUN',native_objects='STRUCTURALLY_VERIFIED',
 product_compiler_selected=False,skill_created=False,production_gold_approved=0,
 blueprint_changed=False,phase0_changed=False,phase3_started=False,
 two_reviewer_gate='PENDING; DO NOT MARK COMPLETE',
 next_action='Obtain explicit authorization for two isolated reviewer agents, or collect two independent external reviews using the prepared packet.',
 icons_palette_phase=5,compiler_spike_phase=6,user_additional_ppt_required=False))
print(json.dumps({'artifacts':artifacts,'object_counts':[t['object_inventory'] for t in technical]},ensure_ascii=False))
