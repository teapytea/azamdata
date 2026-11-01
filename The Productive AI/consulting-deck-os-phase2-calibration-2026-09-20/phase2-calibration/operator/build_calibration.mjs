import fs from 'node:fs/promises';
import path from 'node:path';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {resolvePresentationFont,applyPresentationChartFont,finalizePresentation} from '/root/.codex/skills/builtins/presentations/container_tools/artifact_tool_utils.mjs';

const root='/workspace/scratch/f07178664169/phase2_calibration_2026_09_20';
const packet=path.join(root,'deliverables/reviewer-packet');
const skill='/root/.codex/skills/builtins/presentations';
const family=resolvePresentationFont({fontFamily:'Arial'});
const colors={ink:'#153447',teal:'#008799',muted:'#5B6974',line:'#D6E0E5',pale:'#F0F5F7',white:'#FFFFFF',red:'#AF4037'};
const read=async n=>JSON.parse(await fs.readFile(path.join(packet,'cases',n),'utf8'));
const c2=await read('c02-expected.json'),c3=await read('c03-expected.json'),c4=await read('c04-expected.json');
const f=(n,p=1)=>Number(n).toFixed(p).replace('.',',');
const decimalText=value=>String(value).replace(/(?<=\d),(?=\d)/g,'.');
const audit=[];

function text(slide,value,x,y,w,h,size=24,bold=false,color=colors.ink){
  const s=slide.shapes.add({geometry:'textbox',position:{left:x,top:y,width:w,height:h},fill:'none',line:{fill:'none',width:0}});
  s.text=decimalText(value);
  s.text.style={typeface:family,fontSize:size,bold,color,autoFit:'none',verticalAlignment:'middle',wrap:true};
  return s;
}
function start(p,id,num,title,context,source){
  const s=p.slides.add();s.background.fill=colors.white;
  text(s,title,56,36,1168,96,38,true);
  text(s,context,56,145,1168,32,20,false,colors.muted);
  text(s,`Kasus sintetis untuk kalibrasi. Sumber: ${source}.`,56,679,1090,22,12,false,colors.muted);
  text(s,`${id}${num}`,1173,679,51,22,12,false,colors.muted);
  return s;
}
function table(slide,values,{x=56,y=208,w=1168,h=330,widths,fsz=22,highlightRows=[]}={}){
  const options={rows:values.length,columns:values[0].length,left:x,top:y,width:w,height:h,values:values.map(row=>row.map(decimalText))};
  if(widths)options.columnWidths=widths;
  const t=slide.tables.add(options);
  t.styleOptions={headerRow:false,bandedRows:false};
  t.borders.assign({style:'solid',fill:colors.line,width:0.7});
  t.cells.block({row:0,column:0,rowCount:values.length,columnCount:values[0].length}).assign({
    textStyle:{typeface:family,fontSize:fsz,color:colors.ink},
    margins:{left:14,right:12,top:9,bottom:8},anchor:'center'});
  for(let r=0;r<values.length;r++){
    t.rows[r].height=h/values.length;
    for(let c=0;c<values[0].length;c++){
      const cell=t.getCell(r,c);
      cell.fill=r===0?colors.ink:highlightRows.includes(r)?'#E7F3F5':colors.white;
      cell.text.style={typeface:family,fontSize:r===0?fsz-1:fsz,bold:r===0||highlightRows.includes(r),color:r===0?colors.white:colors.ink};
    }
  }
  return t;
}
function chart(slide,categories,series,{x=56,y=215,w=764,h=365,min=0,max,format='0.0',legend=false}={}){
  const ch=slide.charts.add('bar',{
    position:{left:x,top:y,width:w,height:h},categories,series,
    barOptions:{direction:'column',grouping:'clustered',gapWidth:90},
    hasLegend:legend,legend:{position:'bottom',overlay:false,textStyle:{typeface:family,fontSize:18}},
    chartFill:colors.white,plotAreaFill:colors.white,
    xAxis:{visible:true,tickLabelPosition:'low',textStyle:{typeface:family,fontSize:20,fill:colors.ink},line:{fill:colors.line,width:1},majorGridlines:null},
    yAxis:{visible:true,min,...(max===undefined?{}:{max}),numberFormatCode:format,
      textStyle:{typeface:family,fontSize:17,fill:colors.muted},line:{fill:colors.line,width:1},majorGridlines:{fill:colors.line,width:0.7}},
    dataLabels:{showValue:true,position:'outEnd',textStyle:{typeface:family,fontSize:21,fill:colors.ink,bold:true}},
  });
  applyPresentationChartFont(ch,{fontFamily:family});
  return ch;
}
function notes(s,refs,extra=''){
  s.speakerNotes.textFrame.setText('SIMULASI ORISINAL. Materi kalibrasi, bukan keputusan perusahaan nyata.\nBukti sumber: '+refs+'\n'+extra);
}
function side(s,label,value,detail,y=220){
  text(s,label,874,y,350,30,20,true,colors.muted);
  text(s,value,874,y+42,350,76,54,true,colors.teal);
  text(s,detail,874,y+138,330,180,24);
}
function makeA(){
 const p=Presentation.create({slideSize:{width:1280,height:720}});let s;
 s=start(p,'A',1,'Partner memenuhi batas dana dan waktu\nuntuk memasuki Market B','Komite investasi simulasi. Keputusan masuk pasar. Dana dalam Rp miliar.','SYN-C02, input dan expected output');
 table(s,[['Pasar','Skor tertimbang','Prioritas'],['Market A','4,1','2'],['Market B','4,2','1'],['Market C','3,8','3']],{w:760,widths:[270,250,240],h:300,highlightRows:[2]});
 side(s,'Otorisasi yang diminta','Rp1,5 miliar','Dana awal partner. Persetujuan masih diminta dengan syarat kontrak dan validasi economics.',215);
 text(s,'Skor 1–5 merupakan asumsi prioritisasi. Bobot demand dan economics masing-masing 30%, reach dan risk resilience masing-masing 20%.',56,550,1156,82,21);
 notes(s,'cases/c02-market-entry.json#/market_weights; #/market_scores; #/decision. cases/c02-expected.json#/market_scores; #/selected_mode.','Ruang lingkup: shortlist lebih dahulu, kemudian entry modes untuk B. Tidak mengklaim optimum gabungan seluruh pasar dan mode.');
 s=start(p,'A',2,'Build direct memberi NPV terbesar,\ntetapi melampaui batas dana dan waktu','Perbandingan mode untuk Market B. Diskonto 12%. Batas dana awal 3,0 dan launch 6 bulan.','SYN-C02, empat opsi');
 table(s,[['Mode','Dana awal','Launch\nbulan','NPV\ndasar','NPV\ndownside','Kelayakan'],
  ['Do nothing','0,0','—','0,000','0,000','Fallback'],['Partner','1,5','4',f(c2.modes[1].npv,3),f(c2.modes[1].downside_npv,3),'Memenuhi'],
  ['Build direct','4,8','9',f(c2.modes[2].npv,3),f(c2.modes[2].downside_npv,3),'Gagal dana\ndan waktu'],['Acquire','6,5','4',f(c2.modes[3].npv,3),f(c2.modes[3].downside_npv,3),'Gagal dana']],
  {h:350,widths:[218,153,147,176,186,288],fsz:22,highlightRows:[2]});
 text(s,'Basis setara: arus kas proyek incremental sebelum pajak dan pendanaan, t0 + lima periode tahunan. Tidak ada terminal business value.',56,580,1168,61,22);
 notes(s,'cases/c02-expected.json#/modes; cases/c02-market-entry.json#/decision_constraints; #/model_basis.');
 s=start(p,'A',3,'NPV partner tetap positif saat\nannual contribution turun 20%','NPV dalam Rp miliar. Diskonto 12%. Opex dan biaya awal tetap pada downside.','SYN-C02, partner');
 chart(s,['Base','Downside'],[{name:'NPV',values:[Number(c2.modes[1].npv.toFixed(3)),Number(c2.modes[1].downside_npv.toFixed(3))],fill:colors.teal,valuesFormatCode:'0.000'}],{min:0,max:4,format:'0.0'});
 side(s,'Kebutuhan dana awal','1,5','Peluncuran 4 bulan memenuhi batas 6 bulan. Hasil bergantung pada asumsi contribution dan kontrak.',220);
 text(s,'Cashflow partner t0–t5: -1,5 / 0,6 / 1,0 / 1,4 / 1,6 / 2,2. Nilai t5 mencakup pemulihan working capital 0,5.',56,599,1168,54,20);
 notes(s,'cases/c02-expected.json#/modes/1; cases/c02-market-entry.json#/downside; #/model_basis.','Sensitivity bukan probabilitas. NPV chart dibulatkan tiga desimal; kalkulasi sumber memakai input penuh.');
 s=start(p,'A',4,'Komite diminta menyetujui Rp1,5 miliar\ndengan tiga syarat pelepasan dana','DEC-C02-01. Simulated Investment Committee. Tenggat 1 Oktober 2026.','SYN-C02, decision contract');
 table(s,[['Syarat','Bukti sebelum pencairan'],['Kontrak partner','Perjanjian ditandatangani'],['Economics','CFO memvalidasi contribution dan downside'],['Waktu peluncuran','Launch plan tetap paling lama enam bulan']],{h:310,widths:[370,798],fsz:25});
 text(s,'Status: persetujuan masih diminta',56,552,1168,44,28,true,colors.teal);
 text(s,'Jika syarat tidak terpenuhi, gunakan do nothing sebagai fallback.',56,607,1168,42,24);
 notes(s,'cases/c02-market-entry.json#/decision.','REQUESTED_NOT_APPROVED. Tidak ada approval yang disimpulkan dari nilai NPV.');
 return {id:'A',p,tableOwners:[1,2,4],chartOwners:[3]};
}
function makeB(){
 const p=Presentation.create({slideSize:{width:1280,height:720}});let s;
 s=start(p,'B',1,'EBIT Juni melampaui anggaran\nsebesar Rp1,1 miliar','Board review simulasi. As-of 30 Juni 2026. Rapat 8 Juli 2026. Rp miliar.','SYN-C03, monthly dan YTD');
 chart(s,['Budget','Actual'],[{name:'EBIT Juni',values:[1.5,.4],fill:colors.teal,valuesFormatCode:'0.0'}],{min:0,max:2});
 side(s,'EBIT YTD actual','7,1','Budget YTD 9,0. Juni sudah termasuk dalam YTD.',220);
 notes(s,'cases/c03-expected.json#/monthly_budget; #/monthly_actual; #/monthly_ebit_variance; #/ytd_ebit.');
 s=start(p,'B',2,'Forecast EBIT FY mencapai\nbudget Rp18,0 miliar','Forecast FY2026. Rp miliar. Versi 30 Juni 2026.','SYN-C03, forecast dan actions');
 table(s,[['Komponen','Dampak / hasil'],['Forecast sebelum aksi','16,1'],['Aksi volume dan pricing','+0,5'],['Penghematan tambahan','+0,6'],['Penagihan piutang Juli','+0,8'],['Forecast EBIT FY','18,0']],{h:360,widths:[808,360],fsz:25,highlightRows:[5]});
 text(s,'Penagihan piutang dan penghematan tambahan menopang pencapaian laba tahunan.',56,602,1168,48,23);
 notes(s,'cases/c03-performance-review.json#/forecast; #/actions; cases/c03-expected.json#/final_forecast_ebit.');
 s=start(p,'B',3,'Aksi perbaikan mencakup volume,\npricing, kas, dan biaya','Action register. As-of 30 Juni 2026. Rp miliar.','SYN-C03, actions');
 table(s,[['Aksi','Owner','Tenggat','Dampak','Status'],['Conversion plan','Head of Sales','15 Juli','+0,3 EBIT','Committed'],['Discount control','Commercial Director','10 Juli','+0,2 EBIT','Committed'],['Penagihan piutang','—','12 Juli','+0,8 kas','Conditional'],['Penghematan opex','COO','—','+0,6 EBIT','Potential']],{h:350,widths:[284,275,173,206,230],fsz:21});
 text(s,'Pemantauan aksi dilakukan pada review manajemen berikutnya.',56,602,1168,48,24);
 notes(s,'cases/c03-performance-review.json#/actions; #/issues; #/decisions.');
 s=start(p,'B',4,'Board telah menyetujui perubahan\ncredit control dan eskalasi kas','DEC-C03-01. Rapat board simulasi 8 Juli 2026.','SYN-C03, decision log');
 table(s,[['Keputusan','Catatan'],['Status','APPROVED'],['Pemilik keputusan','Simulated Board'],['Dampak kas Juli','Tambahan 0,8 membawa kas ke 3,0'],['Langkah berikutnya','Jalankan credit control dan eskalasi mingguan']],{h:345,widths:[372,796],fsz:24});
 notes(s,'cases/c03-performance-review.json#/decisions/1; #/actions/2; cases/c03-expected.json#/conditional_july_cash.');
 return {id:'B',p,tableOwners:[2,3,4],chartOwners:[1]};
}
function makeC(){
 const p=Presentation.create({slideSize:{width:1280,height:720}});let s;
 s=start(p,'C',1,'Business case automasi','Komite investasi simulasi. Permintaan persetujuan bersyarat. Rp miliar.','SYN-C04, base case');
 table(s,[['Metrik dasar','Nilai'],['Dana awal','5,0'],['XNPV pada hurdle 10%',f(c4.scenarios[0].xnpv,3)],['XIRR',f(c4.scenarios[0].xirr*100,2)+'%'],['Batas dana awal','5,5']],{w:760,h:330,widths:[520,240],fsz:25});
 text(s,'Komitmen penuh menunggu penanganan risiko downside dan otorisasi biaya.',874,221,345,184,30,true);
 text(s,'Status persetujuan: masih diminta',874,450,345,93,24,false,colors.muted);
 text(s,'Project cashflow incremental sebelum tax dan financing. Discount rate 10% merupakan asumsi sintetis.',56,594,1168,56,22);
 notes(s,'cases/c04-investment-case.json#/perspective; #/discount_basis; #/decision. cases/c04-expected.json#/scenarios/0; #/recommendation.');
 s=start(p,'C',2,'Arus kas proyek','Kas diakui pada 31 Desember setiap tahun. Rp miliar.','SYN-C04, cashflow bertanggal');
 chart(s,['2026','2027','2028','2029','2030','2031'],[{name:'Net cashflow',values:c4.scenarios[0].cashflows,fill:colors.teal,valuesFormatCode:'0.0'}],{x:56,y:222,w:760,h:358,min:-6,max:4});
 table(s,[['Tahun','Kas kumulatif'],['2026','-5,0'],['2027','-3,8'],['2028','-2,1'],['2029','-0,2'],['2030','2,2'],['2031','5,6']],{x:874,y:210,w:350,h:365,widths:[140,210],fsz:20});
 text(s,'Payback: akhir tahun ke-4 (undiscounted). Kas 2031 termasuk recovery working capital 0,6 dan disposal 0,4.',56,602,1168,59,20);
 notes(s,'cases/c04-expected.json#/scenarios/0; cases/c04-investment-case.json#/cashflow_dates; #/timing; #/operating_years.');
 s=start(p,'C',3,'Sensitivitas investasi','XNPV memakai actual days/365 dan hurdle 10%. Rp miliar.','SYN-C04, empat skenario');
 table(s,[['Skenario','Dana awal','XNPV','XIRR','Catatan'],...c4.scenarios.map((a,i)=>[
   ['Base','Benefit turun 20%','Capex naik 20%','Combined downside'][i],f(a.initial_funding),f(a.xnpv,3),f(a.xirr*100,2)+'%',
   ['Memenuhi batas base','Return lebih rendah','Dana di atas batas','NPV negatif dan dana di atas batas'][i]
 ])],{h:350,widths:[280,156,157,155,420],fsz:22});
 text(s,'Combined downside: benefit ×0,8, opex ×1,15, capex ×1,2. Implementasi, working capital, dan disposal tetap.',56,590,1168,62,22);
 notes(s,'cases/c04-investment-case.json#/scenarios; #/scope_notes; #/decision. cases/c04-expected.json#/scenarios; #/gates.');
 s=start(p,'C',4,'Syarat persetujuan','DEC-C04-01. Simulated Investment Committee. Tenggat 15 Oktober 2026.','SYN-C04, decision contract');
 table(s,[['Area','Persyaratan sebelum komitmen'],['Supplier','Quote bertanda tangan harus sesuai cost envelope yang disetujui.'],['Operasi','Benefit ramp perlu validasi dan pemeriksaan double counting.'],['Finance','CFO memvalidasi liquidity dan kesesuaian model pre-tax.'],['Downside','NPV downside negatif atau dana awal melebihi 5,5 memerlukan otorisasi ulang.'],['Status','Persetujuan masih diminta. Komitmen penuh ditahan selama syarat belum terselesaikan.']],{h:380,widths:[230,938],fsz:22});
 notes(s,'cases/c04-investment-case.json#/decision; cases/c04-expected.json#/recommendation.','Model tidak memasukkan pajak, tax shield, financing, atau going-concern terminal value.');
 return {id:'C',p,tableOwners:[1,2,3,4],chartOwners:[2]};
}
await fs.mkdir(path.join(root,'validation'),{recursive:true});
for(const d of [makeA(),makeB(),makeC()]){
 const candidate=path.join(root,'build',`candidate-${d.id}-v2.pptx`);
 const final=path.join(packet,'decks',`calibration-${d.id}-v2.pptx`);
 await (await PresentationFile.exportPptx(d.p)).save(candidate);
 await finalizePresentation({workspaceDir:root,candidatePath:candidate,finalPath:final,
  pythonExecutable:process.env.CODEX_PRIMARY_RUNTIME_PYTHON,
  integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),
  explicitTotalSlideCount:4,requiredNativeTableOwnerSlides:d.tableOwners,requiredNativeChartOwnerSlides:d.chartOwners,
  materializeLiteralChartWorkbooks:true,
  layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-heading-fit',...d.tableOwners.flatMap(n=>['--require-native-table-slide',String(n)])],
  fontPolicy:{basis:'design',families:[family]},verifyArtifactToolImport:true,
  receiptPath:path.join(root,'validation',`calibration-${d.id}-v2.validation.json`)
 });
 // Preview from the same authored model, then render/import the finalized artifact separately for delivery checks.
 for(let i=0;i<d.p.slides.items.length;i++){
  const s=d.p.slides.items[i];
  const preview=await d.p.export({slide:s,format:'png',scale:1});
  await fs.writeFile(path.join(root,'build',`${d.id}-${i+1}.png`),new Uint8Array(await preview.arrayBuffer()));
 }
 audit.push({id:d.id,slides:4,finalPath:final,tables:d.tableOwners,charts:d.chartOwners,font:family});
 console.log(JSON.stringify(audit.at(-1)));
}
await fs.writeFile(path.join(root,'validation/build-summary.json'),JSON.stringify(audit,null,2));
