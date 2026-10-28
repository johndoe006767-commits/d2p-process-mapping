/* Process relationships and handoffs from the original Commercial FP&A high-level map. */
(()=>{
const HLP=[
 {id:"FPAC-01.01",t:"Revenue Planning",st:1,c:0,r:1,inp:["Brand Managers (MC) ↓ volume + net price"],out:["Final revenue plan → PMR (Group)"]},
 {id:"FPAC-02.01",t:"MPC Planning",st:2,c:1,r:0,inp:["HR + BUDs (MC) ↓ FTE, MPC, MPDC, VR%"]},
 {id:"FPAC-02.03",t:"CAPEX Planning",st:2,c:1,r:1,inp:["Region template · CBP ↓ business CAPEX"],out:["CAPEX plan → Region / Group → CAS (CAPEX)"]},
 {id:"FPAC-02.02",t:"NMPC Planning",st:2,c:1,r:2,inp:["Cost centre owners (MC) ↓ cost forecast"]},
 {id:"FPAC-03.01",t:"P&L Planning",st:3,c:2,r:1,inp:["Royalty team → FET ↓ royalty rates in P&MR","Product Costing → FET ↓ SCC per SKU in P&MR"]},
 {id:"FPAC-04.01",t:"System Submission",st:4,c:3,r:1,inp:["Embedded Finance ↓ Sales / Cost Tool files"]},
 {id:"FPAC-05.01",t:"Review Deck",st:5,c:4,r:1,inp:["International Finance ↓ template + deck"]}];
const HLD=["Approved revenue plan → Demand Planning (FP&A Ops)","Revenue plan → Controlling (DSO forecast)","Approved cost plan → MC business execution","Pre-read → Area / International; GM + CFO sign-off"];
const HLM=[
 {id:"FPAC-06.01",t:"Pre-Close",st:6,inp:"Controllers · P2P · Payroll ↓ accruals",out:"Preclose review → CFO + CP"},
 {id:"FPAC-07.01",t:"Revenue Reporting",st:7,inp:"O2C / R2R ↓ sales postings, MEC",out:"Files → FBPs + Brand Managers"},
 {id:"FPAC-07.02",t:"Cost Reporting",st:7,inp:"R2R ↓ MEC complete (WD+2)",out:"Files → FBPs + budget owners"},
 {id:"FPAC-08.01",t:"Mid-Month Forecast",st:8,inp:"BUDs (MC) ↓ bottom-up sales forecast",out:"MMF → Group / International"},
 {id:"FPAC-09.01",t:"FCF Controls",st:9,inp:"Evidence FSC008 / 009 / 011 ↓",out:"Approval record → OneGRC (audit)"}];

window.FPAC_FLOW={planning:HLP,monthly:HLM,downstream:HLD};
})();
