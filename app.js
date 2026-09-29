let user=null, exam=null, questions=[], answers={}, idx=0, attemptId=null, timerHandle=null, endAt=null;

const $=id=>document.getElementById(id);
function show(id){["loginView","homeView","examView","resultView"].forEach(x=>$(x).classList.add("hidden"));$(id).classList.remove("hidden")}
function msg(id,t){$(id).textContent=t}

async function boot(){
 const {data}=await supabaseClient.auth.getSession(); user=data.session?.user||null;
 if(user){show("homeView");$("watermark").textContent=user.email}else show("loginView");
}
$("loginBtn").onclick=async()=>{
 const {error}=await supabaseClient.auth.signInWithPassword({email:$("email").value,password:$("password").value});
 if(error) msg("loginMsg",error.message); else {user=(await supabaseClient.auth.getUser()).data.user;show("homeView");$("watermark").textContent=user.email}
};
$("signupBtn").onclick=async()=>{
 const {error}=await supabaseClient.auth.signUp({email:$("email").value,password:$("password").value});
 msg("loginMsg",error?error.message:"가입 요청이 완료되었습니다. 이메일 인증이 켜져 있다면 메일을 확인하세요.");
};
$("logoutBtn").onclick=async()=>{await supabaseClient.auth.signOut();location.reload()};

$("startBtn").onclick=async()=>{
 const code=$("examCode").value.trim(); if(!code)return msg("homeMsg","시험 코드를 입력하세요.");
 $("startBtn").disabled=true; msg("homeMsg","시험 정보를 확인하는 중...");
 const {data,error}=await supabaseClient.rpc("start_exam",{p_exam_code:code});
 $("startBtn").disabled=false;
 if(error){msg("homeMsg",error.message);return}
 exam=data.exam; questions=data.questions||[]; attemptId=data.attempt_id; idx=0; answers={};
 endAt=new Date(data.end_at).getTime(); $("examTitle").textContent=exam.title;
 show("examView"); render(); startTimer();
};

function render(){
 const q=questions[idx]; $("progress").textContent=`문제 ${idx+1} / ${questions.length}`;
 $("question").innerHTML=`<div class="quiz-text">Q. ${escapeHtml(q.question)}</div>`;
 $("options").innerHTML=q.options.map((o,i)=>`<label class="option"><input type="radio" name="choice" value="${i}" ${answers[q.id]===i?"checked":""}> ${i+1}. ${escapeHtml(o)}</label>`).join("");
 $("options").querySelectorAll("input").forEach(r=>r.onchange=()=>answers[q.id]=Number(r.value));
 $("prevBtn").disabled=idx===0;$("nextBtn").textContent=idx===questions.length-1?"제출":"다음 ➡";
}
$("prevBtn").onclick=()=>{if(idx>0){idx--;render()}};
$("nextBtn").onclick=()=>{if(idx<questions.length-1){idx++;render()}else submitExam()};
$("submitBtn").onclick=submitExam;

async function submitExam(){
 if(!confirm("시험을 제출하시겠습니까?"))return;
 clearInterval(timerHandle);
 const payload=Object.entries(answers).map(([question_id,choice_index])=>({question_id,choice_index}));
 const {data,error}=await supabaseClient.rpc("submit_exam",{p_attempt_id:attemptId,p_answers:payload});
 if(error){alert(error.message);return}
 show("resultView"); $("result").innerHTML=`<div class="result">${data.score}점</div><p class="success">총 ${data.total}문항 중 ${data.correct}문항 정답</p>`+
 (data.wrongs||[]).map(w=>`<div class="wrong"><b>문제:</b> ${escapeHtml(w.question)}<br>내 답: ${escapeHtml(w.user_answer||"미답안")}<br>정답: ${escapeHtml(w.correct_answer)}</div>`).join("");
}
$("homeBtn").onclick=()=>{location.reload()};
function startTimer(){clearInterval(timerHandle);updateTimer();timerHandle=setInterval(updateTimer,1000)}
function updateTimer(){let sec=Math.max(0,Math.floor((endAt-Date.now())/1000));$("timer").textContent=`${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;if(sec<=0){clearInterval(timerHandle);submitExam()}}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
boot();
