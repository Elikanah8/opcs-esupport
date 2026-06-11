"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, ListTodo, CheckCircle, Settings, LogOut, MapPin, User, Menu } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

type Priority = "low"|"medium"|"high"|"critical";
type Status = "submitted"|"claimed"|"in_progress"|"awaiting"|"resolved"|"closed";
type Ticket = { id:number; reference:string; title:string; priority:Priority; status:Status; location:string; submitted_by_name:string; created_at:string; claimed_by_name?:string|null };

const pStyle:Record<Priority,{bg:string;text:string}> = { low:{bg:"#E8F5EE",text:"#1A6B3C"}, medium:{bg:"#FFF4E5",text:"#FF8C00"}, high:{bg:"#FFE5E5",text:"#CC0000"}, critical:{bg:"#3D0000",text:"#FF6B6B"} };
const nav = [ {icon:LayoutDashboard,label:"Dashboard",href:"/intern"}, {icon:ListTodo,label:"My Tickets",href:"/intern/tickets"}, {icon:CheckCircle,label:"Resolved",href:"/intern/resolved"}, {icon:Settings,label:"Settings",href:"/intern/settings"} ];

export default function InternResolvedPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const myName = user?.name || "Intern";

  const fetch = useCallback(async () => {
    try { const r = await api.get("/api/tickets/"); setTickets(r.data.filter((t:Ticket) => t.status === "resolved" || t.status === "closed")); }
    catch { /**/ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="dash-layout">
      {/* Overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* SIDEBAR */}
      <aside className={`dash-sidebar${sidebarOpen ? " open" : ""}`}>
        <div style={{padding:24,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <img src="/coat-of-arms.jpg" alt="OPCS" style={{width:40,height:40,objectFit:"contain"}} />
            <div><p style={{color:"white",fontWeight:800,fontSize:14}}>OPCS eSupport</p><p style={{color:"#93C5FD",fontSize:11}}>Intern Portal</p></div>
          </div>
        </div>
        <nav style={{flex:1,padding:16,display:"flex",flexDirection:"column",gap:4}}>
          {nav.map((item,i) => (
            <button key={i} onClick={() => { router.push(item.href); setSidebarOpen(false); }}
              style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,border:"none",cursor:"pointer",
                backgroundColor:item.href==="/intern/resolved"?"rgba(255,255,255,0.15)":"transparent",
                color:item.href==="/intern/resolved"?"white":"rgba(255,255,255,0.55)",
                fontSize:14,fontWeight:600,textAlign:"left",width:"100%"}}>
              <item.icon size={18} />{item.label}
            </button>
          ))}
        </nav>
        <div style={{padding:16,borderTop:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",backgroundColor:"#FFCC00",color:"#003399",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{myName.charAt(0)}</div>
            <div style={{overflow:"hidden",flex:1}}><p style={{color:"white",fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{myName}</p><p style={{color:"#93C5FD",fontSize:11}}>ICT Intern</p></div>
            <button onClick={() => { logout(); router.push("/login"); }} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:4}}><LogOut size={15} color="#93C5FD" /></button>
          </div>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-header">
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button className="mob-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
              <Menu size={22} />
            </button>
            <div>
              <h1 style={{fontSize:20,fontWeight:800,color:"#003399"}}>Resolved Tickets</h1>
              <p style={{fontSize:12,color:"#94A3B8",marginTop:2}}>Tickets that have been successfully resolved</p>
            </div>
          </div>
        </header>
        <div style={{height:4,backgroundColor:"#FFCC00",flexShrink:0}} />
        <main className="dash-content">

          {/* Stats */}
          <div className="stat-grid-3">
            {[{label:"Total Resolved",value:tickets.length,color:"#1A6B3C"},{label:"Resolved by Me",value:tickets.filter(t=>t.claimed_by_name===myName).length,color:"#003399"},{label:"Closed",value:tickets.filter(t=>t.status==="closed").length,color:"#64748B"}].map((s,i) => (
              <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                style={{backgroundColor:"white",borderRadius:14,padding:"20px 24px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",borderLeft:`4px solid ${s.color}`}}>
                <p style={{fontSize:28,fontWeight:900,color:s.color,lineHeight:1}}>{loading?"...":s.value}</p>
                <p style={{fontSize:12,color:"#94A3B8",marginTop:6}}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div style={{backgroundColor:"white",borderRadius:16,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",overflow:"hidden"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{backgroundColor:"#F8FAFC"}}>
                  {["Reference","Title","Location","Submitted By","Resolved By","Priority","Date"].map(h=>(
                    <th key={h} style={{padding:"10px 20px",textAlign:"left",fontSize:11,fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {!loading && tickets.length===0 && <tr><td colSpan={7} style={{padding:48,textAlign:"center",color:"#94A3B8"}}>No resolved tickets yet.</td></tr>}
                  {tickets.map((t,i) => (
                    <motion.tr key={t.id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}}
                      style={{borderTop:"1px solid #F1F5F9"}}
                      onMouseEnter={e=>(e.currentTarget.style.backgroundColor="#F8FAFC")}
                      onMouseLeave={e=>(e.currentTarget.style.backgroundColor="transparent")}>
                      <td style={{padding:"14px 20px"}}><span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:"#1A6B3C"}}>{t.reference}</span></td>
                      <td style={{padding:"14px 20px",maxWidth:200}}><p style={{fontSize:13,fontWeight:600,color:"#1E293B",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{t.title}</p></td>
                      <td style={{padding:"14px 20px"}}><div style={{display:"flex",alignItems:"center",gap:4}}><MapPin size={12} color="#94A3B8" /><span style={{fontSize:13,color:"#64748B"}}>{t.location}</span></div></td>
                      <td style={{padding:"14px 20px"}}><div style={{display:"flex",alignItems:"center",gap:4}}><User size={12} color="#94A3B8" /><span style={{fontSize:13,color:"#64748B"}}>{t.submitted_by_name}</span></div></td>
                      <td style={{padding:"14px 20px"}}><span style={{fontSize:13,color:"#1A6B3C",fontWeight:600}}>{t.claimed_by_name||"—"}</span></td>
                      <td style={{padding:"14px 20px"}}><span style={{padding:"4px 10px",borderRadius:99,fontSize:11,fontWeight:700,backgroundColor:pStyle[t.priority]?.bg,color:pStyle[t.priority]?.text}}>{t.priority.charAt(0).toUpperCase()+t.priority.slice(1)}</span></td>
                      <td style={{padding:"14px 20px"}}><span style={{fontSize:12,color:"#94A3B8"}}>{new Date(t.created_at).toLocaleDateString()}</span></td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
