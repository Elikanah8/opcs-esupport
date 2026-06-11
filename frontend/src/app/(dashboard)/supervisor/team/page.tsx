"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, TicketIcon, Users, BarChart2, Settings, LogOut, UserCheck, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

type InternStat = { name: string; claimed: number; resolved: number; status?: string };
type Analytics  = { intern_stats: InternStat[] };

const nav = [
  {icon:LayoutDashboard, label:"Overview",    href:"/supervisor"},
  {icon:TicketIcon,      label:"All Tickets", href:"/supervisor/tickets"},
  {icon:Users,           label:"Intern Team", href:"/supervisor/team"},
  {icon:BarChart2,       label:"Analytics",   href:"/supervisor/analytics"},
  {icon:Settings,        label:"Settings",    href:"/supervisor/settings"},
];

export default function SupervisorTeamPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics|null>(null);
  const [loading, setLoading] = useState(true);
  const myName = user?.name || "Supervisor";

  const fetchData = useCallback(async () => {
    try { const r = await api.get("/api/analytics/summary/"); setAnalytics(r.data); }
    catch { /**/ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const interns = analytics?.intern_stats || [];
  const totalClaimed  = interns.reduce((a, i) => a + i.claimed,  0);
  const totalResolved = interns.reduce((a, i) => a + i.resolved, 0);

  return (
    <div style={{display:"flex",height:"100vh",width:"100%",overflow:"hidden",backgroundColor:"#F5F7FA"}}>

      {/* SIDEBAR */}
      <aside style={{width:240,minWidth:240,display:"flex",flexDirection:"column",height:"100%",backgroundColor:"#003399"}}>
        <div style={{padding:24,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <img src="/coat-of-arms.jpg" alt="OPCS" style={{width:40,height:40,objectFit:"contain"}} />
            <div><p style={{color:"white",fontWeight:800,fontSize:14}}>OPCS eSupport</p><p style={{color:"#93C5FD",fontSize:11}}>Supervisor Panel</p></div>
          </div>
        </div>
        <nav style={{flex:1,padding:16,display:"flex",flexDirection:"column",gap:4}}>
          {nav.map((item,i) => (
            <button key={i} onClick={() => router.push(item.href)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:12,border:"none",cursor:"pointer",
                backgroundColor:item.href==="/supervisor/team"?"rgba(255,255,255,0.15)":"transparent",
                color:item.href==="/supervisor/team"?"white":"rgba(255,255,255,0.55)",
                fontSize:14,fontWeight:600,textAlign:"left",width:"100%"}}>
              <item.icon size={18} />{item.label}
            </button>
          ))}
        </nav>
        <div style={{padding:16,borderTop:"1px solid rgba(255,255,255,0.1)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",backgroundColor:"#FFCC00",color:"#003399",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,flexShrink:0}}>{myName.charAt(0)}</div>
            <div style={{overflow:"hidden",flex:1}}><p style={{color:"white",fontSize:13,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{myName}</p><p style={{color:"#93C5FD",fontSize:11}}>ICT Director</p></div>
            <button onClick={() => { logout(); router.push("/login"); }} style={{background:"none",border:"none",cursor:"pointer",display:"flex",padding:4}}><LogOut size={15} color="#93C5FD" /></button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <header style={{padding:"16px 32px",backgroundColor:"white",borderBottom:"1px solid #E2E8F0",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <h1 style={{fontSize:20,fontWeight:800,color:"#003399"}}>Intern Team</h1>
            <p style={{fontSize:12,color:"#94A3B8",marginTop:2}}>Performance overview of all ICT interns</p>
          </div>
          <button onClick={() => fetchData()} style={{padding:"8px 18px",borderRadius:10,border:"1.5px solid #E2E8F0",backgroundColor:"white",color:"#003399",fontSize:13,fontWeight:700,cursor:"pointer"}}>
            ↻ Refresh
          </button>
        </header>
        <div style={{height:4,backgroundColor:"#FFCC00",flexShrink:0}} />

        <main style={{flex:1,overflowY:"auto",padding:32}}>

          {/* Team Summary Cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:28}}>
            {[
              {label:"Total Interns",   value:interns.length,  color:"#003399", icon:Users},
              {label:"Tickets Claimed", value:totalClaimed,    color:"#FF8C00", icon:TicketIcon},
              {label:"Tickets Resolved",value:totalResolved,   color:"#1A6B3C", icon:UserCheck},
            ].map((s,i) => (
              <motion.div key={i} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                style={{backgroundColor:"white",borderRadius:14,padding:"22px 24px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)",display:"flex",alignItems:"center",gap:16}}>
                <div style={{width:52,height:52,borderRadius:14,backgroundColor:s.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <s.icon size={24} color={s.color} />
                </div>
                <div>
                  <p style={{fontSize:32,fontWeight:900,color:s.color,lineHeight:1}}>{loading?"...":s.value}</p>
                  <p style={{fontSize:13,color:"#94A3B8",marginTop:4}}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Intern Cards Grid */}
          {!loading && interns.length === 0 ? (
            <div style={{backgroundColor:"white",borderRadius:16,padding:64,textAlign:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
              <AlertCircle size={40} color="#94A3B8" style={{margin:"0 auto 16px"}} />
              <p style={{fontSize:16,fontWeight:700,color:"#64748B"}}>No intern activity yet</p>
              <p style={{fontSize:13,color:"#94A3B8",marginTop:6}}>Interns will appear here once they start claiming tickets.</p>
            </div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20}}>
              {interns.map((intern, i) => {
                const rate = intern.claimed > 0 ? Math.round((intern.resolved / intern.claimed) * 100) : 0;
                const rateColor = rate >= 80 ? "#1A6B3C" : rate >= 60 ? "#FF8C00" : "#CC0000";
                return (
                  <motion.div key={i} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                    style={{backgroundColor:"white",borderRadius:16,padding:24,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>

                    {/* Avatar + name */}
                    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
                      <div style={{width:52,height:52,borderRadius:"50%",backgroundColor:"#003399",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:20,flexShrink:0}}>
                        {intern.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{fontSize:15,fontWeight:800,color:"#1E293B"}}>{intern.name}</p>
                        <p style={{fontSize:12,color:"#94A3B8",marginTop:2}}>ICT Intern</p>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:18}}>
                      {[
                        {label:"Claimed",  value:intern.claimed,               color:"#003399"},
                        {label:"Resolved", value:intern.resolved,              color:"#1A6B3C"},
                        {label:"Pending",  value:intern.claimed-intern.resolved, color:"#FF8C00"},
                      ].map((s,j) => (
                        <div key={j} style={{textAlign:"center",padding:"10px 0",borderRadius:10,backgroundColor:"#F8FAFC"}}>
                          <p style={{fontSize:22,fontWeight:900,color:s.color}}>{s.value}</p>
                          <p style={{fontSize:11,color:"#94A3B8",marginTop:2}}>{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Resolution rate bar */}
                    <div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:12,color:"#64748B",fontWeight:600}}>Resolution Rate</span>
                        <span style={{fontSize:12,fontWeight:800,color:rateColor}}>{rate}%</span>
                      </div>
                      <div style={{height:8,borderRadius:99,backgroundColor:"#F1F5F9"}}>
                        <div style={{height:"100%",borderRadius:99,backgroundColor:rateColor,width:`${rate}%`,transition:"width 0.6s ease"}} />
                      </div>
                    </div>

                    {/* Status badge */}
                    <div style={{marginTop:14,display:"flex",justifyContent:"flex-end"}}>
                      <span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,
                        backgroundColor:rate>=70?"#E8F5EE":"#FFE5E5",
                        color:rate>=70?"#1A6B3C":"#CC0000"}}>
                        {rate >= 70 ? "✓ Performing Well" : "⚠ Needs Attention"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
