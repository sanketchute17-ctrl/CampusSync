import React, { useState, useEffect } from 'react';
import { User, LogIn, UserPlus, AlertCircle, Eye, EyeOff, Check, Mail, Lock, PlayCircle, Loader2, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginAsGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  // Auth State
  const [emailOrReg, setEmailOrReg] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [regNo, setRegNo] = useState('');
  const [dob, setDob] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [facultyDept, setFacultyDept] = useState('');
  
  // Captcha State
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const [displayText, setDisplayText] = useState('');
  const fullText = 'CAMPUSSYNC';

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayText(fullText.slice(0, i + 1));
      i++;
    }, 100);
    return () => clearInterval(timer);
  }, []);

  const handleForgotPassword = async () => {
    if (!emailOrReg) {
      setError('Please enter your registered email address first.');
      return;
    }
    let parsedEmail = emailOrReg.trim();
    if (!parsedEmail.includes('@')) parsedEmail += '@campussync.edu';
    try {
      await sendPasswordResetEmail(auth, parsedEmail);
      alert(`Password reset link sent to ${parsedEmail}! Please check your inbox.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!emailOrReg || !password) return;
    
    setError(null);

    if (!captchaVerified) {
      setError('Please verify that you are not a robot.');
      return;
    }

    setIsLoading(true);

    let parsedEmail = emailOrReg;
    if (!parsedEmail.includes('@')) {
      parsedEmail = parsedEmail.trim() + '@campussync.edu';
    }

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, parsedEmail, password);
        const user = userCredential.user;

        let storedRole = role;
        try {
          const userDocSnap = await getDoc(doc(db, 'users', user.uid));
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.role) {
              storedRole = data.role.toLowerCase().trim();
            }
          }
        } catch (e) {
          console.warn("Unable to fetch user document on login:", e);
        }

        navigate(storedRole === 'faculty' ? '/faculty-dashboard' : '/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, parsedEmail, password);
        const user = userCredential.user;

        const selectedDept = role === 'student' ? branch : facultyDept;
        const userData = {
          uid: user.uid,
          email: user.email,
          role: role,
          fullName: fullName,
          regNo: regNo,
          empId: regNo,
          department: selectedDept,
          branch: selectedDept,
          dob: dob || '',
          semester: semester || '',
          startYear: startYear || '',
          endYear: endYear || '',
          profilePicUrl: '',
          about: '',
          createdAt: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        alert('Account created successfully! You can now log in with your credentials.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-y-auto sm:overflow-hidden bg-black flex flex-col items-center justify-center font-sans px-3 sm:px-4 py-6 select-none">
      
      {/* 1. Background Image */}
      <img
        src="/assets/login-bg.jpg"
        alt="Campus Background"
        className="fixed top-0 left-0 min-w-full min-h-full w-auto h-auto object-cover object-center z-0 opacity-90"
      />

      {/* 2. Background Overlay */}
      <div className="absolute inset-0 bg-black/30 z-10"></div>

      {/* 3. Floating Light Blobs */}
      <div className="absolute top-[10%] left-[20%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-purple-700/20 rounded-full blur-[100px] z-10 pointer-events-none"></div>
      <div className="absolute bottom-[10%] right-[20%] w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-sky-500/20 rounded-full blur-[100px] z-10 pointer-events-none"></div>

      {/* 4. Floating Form Container (Centered Single Card) */}
      <div className="relative z-20 w-full max-w-[340px] sm:max-w-md my-auto flex flex-col max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden px-2 sm:px-4">
        
        {/* Branding Header & Role Switcher */}
        <div className="flex flex-col items-center mb-3 text-center">
          {/* 1. App Name & Logo AT THE TOP */}
          <div className="w-full flex items-center justify-center mb-1.5">
            <img src="/app-logo.png" alt="CampusSync Logo" className="h-9 sm:h-11 w-auto object-contain mr-2.5 drop-shadow-md" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase border-b-2 border-sky-400/80 pb-0.5 inline-block drop-shadow-md">
              {displayText}
            </h1>
          </div>

          {/* 2. 7-8 Words Sentence UNDER CampusSync & ABOVE Student/Faculty */}
          <p className="text-xs sm:text-sm text-sky-200 font-semibold mb-2.5 tracking-wide drop-shadow">
            Connect, Learn & Share with Verified Campus Peers
          </p>

          {/* 3. Student & Faculty portal toggle BELOW */}
          <div className="flex bg-white/20 backdrop-blur-md p-1 rounded-full w-48 sm:w-56 justify-between relative border border-white/30 shadow-md">
            <div className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-300 shadow-sm ${role === 'faculty' ? 'translate-x-[100%]' : 'translate-x-0'}`}></div>
            <button type="button" onClick={() => { setRole('student'); setError(null); }} className={`flex-1 py-1 text-xs font-extrabold z-10 transition-colors ${role === 'student' ? 'text-white' : 'text-white/70'}`}>Student</button>
            <button type="button" onClick={() => { setRole('faculty'); setError(null); }} className={`flex-1 py-1 text-xs font-extrabold z-10 transition-colors ${role === 'faculty' ? 'text-white' : 'text-white/70'}`}>Faculty</button>
          </div>
        </div>

        {error && (
          <div className="w-full bg-red-500/20 backdrop-blur-md border border-red-400/40 text-red-100 text-xs px-3.5 py-2 rounded-full mb-3 flex items-center gap-2 shadow-md animate-in fade-in duration-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-300" />
            <p className="font-semibold">{error.replace('Firebase:', '').trim()}</p>
          </div>
        )}

        {/* Form */}
        <form className="w-full flex justify-center flex-col gap-2.5" onSubmit={handleAuth}>
          {!isLogin && (
            <div className="space-y-2.5 animate-in slide-in-from-top-4 duration-300">
              <div className="relative w-full">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80 pointer-events-none" />
                <input 
                  type="text" 
                  value={fullName} onChange={(e) => setFullName(e.target.value)} required={!isLogin}
                  placeholder="Full Name (e.g. Rahul Sharma)" 
                  className="w-full pl-10 pr-3.5 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white placeholder:text-white/75 focus:outline-none focus:border-white focus:bg-white/30 focus:ring-2 focus:ring-white/20 transition-all font-semibold text-xs shadow-md"
                />
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={regNo} onChange={(e) => setRegNo(e.target.value)} required={!isLogin}
                  placeholder={role === 'faculty' ? "Employee ID" : "Reg No (EN21001)"} 
                  className="w-full px-3.5 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white placeholder:text-white/75 focus:outline-none focus:border-white focus:bg-white/30 focus:ring-2 focus:ring-white/20 transition-all text-xs font-semibold shadow-md flex-1"
                />
                {role === 'student' && (
                  <input 
                    type="date" 
                    value={dob} onChange={(e) => setDob(e.target.value)} required={!isLogin}
                    className="w-full px-3 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white/90 focus:text-white focus:outline-none focus:border-white focus:bg-white/30 transition-all text-xs font-semibold [color-scheme:dark] shadow-md flex-1"
                  />
                )}
              </div>

              {role === 'student' ? (
                <>
                  <div className="flex gap-2">
                    <select 
                      value={branch} onChange={(e) => setBranch(e.target.value)} required={!isLogin}
                      className="w-full px-3 py-2 bg-slate-900/80 backdrop-blur-xl border border-white/30 rounded-full text-white focus:outline-none focus:border-white transition-all text-xs font-semibold shadow-md flex-[2]">
                      <option value="" disabled>Select Branch</option>
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="IT">Information Tech (IT)</option>
                      <option value="MECH">Mechanical (MECH)</option>
                      <option value="CIVIL">Civil Engg (CIVIL)</option>
                      <option value="EXTC">Electronics (EXTC)</option>
                      <option value="AI">Artificial Intelligence (AI)</option>
                      <option value="AIML">AI & Machine Learning (AIML)</option>
                      <option value="DS">Data Science (DS)</option>
                    </select>

                    <select 
                      value={semester} onChange={(e) => setSemester(e.target.value)} required={!isLogin}
                      className="w-full px-3 py-2 bg-slate-900/80 backdrop-blur-xl border border-white/30 rounded-full text-white focus:outline-none focus:border-white transition-all text-xs font-semibold shadow-md flex-[1]">
                      <option value="" disabled>Sem</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={startYear} onChange={(e) => setStartYear(e.target.value)} required={!isLogin}
                      placeholder="Start Year" min="2010" max="2030"
                      className="w-full px-3.5 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white placeholder:text-white/75 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-xs font-semibold shadow-md flex-1"
                    />
                    <input 
                      type="number" 
                      value={endYear} onChange={(e) => setEndYear(e.target.value)} required={!isLogin}
                      placeholder="End Year" min="2014" max="2034"
                      className="w-full px-3.5 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white placeholder:text-white/75 focus:outline-none focus:border-white focus:bg-white/30 transition-all text-xs font-semibold shadow-md flex-1"
                    />
                  </div>
                </>
              ) : (
                <select 
                  value={facultyDept} onChange={(e) => setFacultyDept(e.target.value)} required={!isLogin}
                  className="w-full px-3.5 py-2 bg-slate-900/80 backdrop-blur-xl border border-white/30 rounded-full text-white focus:outline-none focus:border-white transition-all text-xs font-semibold shadow-md">
                  <option value="" disabled>Select Department</option>
                  <option value="CSE">Computer Science</option>
                  <option value="IT">Information Technology</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="EXTC">Electronics & Telecom</option>
                  <option value="AI">Artificial Intelligence</option>
                  <option value="AIML">AI & Machine Learning</option>
                  <option value="DS">Data Science</option>
                </select>
              )}
            </div>
          )}

          {/* Email Pill Input */}
          <div className="relative w-full">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80 pointer-events-none" />
            <input 
              type="text" 
              value={emailOrReg} onChange={(e) => setEmailOrReg(e.target.value)} required
              placeholder="Enter your registered email" 
              className="w-full pl-10 pr-3.5 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white placeholder:text-white/75 focus:outline-none focus:border-white focus:bg-white/30 focus:ring-2 focus:ring-white/20 transition-all text-xs font-semibold shadow-md"
            />
          </div>

          {/* Password Pill Input */}
          <div className="relative w-full">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/80 pointer-events-none" />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="Enter your password" 
              className="w-full pl-10 pr-10 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white placeholder:text-white/75 focus:outline-none focus:border-white focus:bg-white/30 focus:ring-2 focus:ring-white/20 transition-all text-xs font-semibold shadow-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/75 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Floating Forgot Password Badge */}
          {isLogin && (
            <div className="flex justify-end w-full -mt-0.5">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-sky-200 hover:text-white font-extrabold text-[11px] rounded-full transition-all shadow-sm"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Captcha Section */}
          <div className="w-full mt-0.5">
            <div 
              className="flex items-center justify-between bg-white/95 backdrop-blur-md border border-white rounded-2xl p-2.5 sm:px-4 cursor-pointer shadow-md w-full"
              onClick={() => {
                if (captchaVerified) return;
                setCaptchaLoading(true);
                setTimeout(() => {
                  setCaptchaLoading(false);
                  setCaptchaVerified(true);
                  setError(null);
                }, 300);
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-5 h-5 rounded-md border-2 bg-white flex-shrink-0 transition-all" style={{ borderColor: captchaVerified ? 'transparent' : '#94a3b8' }}>
                   {captchaLoading ? (
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-sky-500 border-t-transparent rounded-full"></span>
                   ) : captchaVerified ? (
                      <Check className="w-4 h-4 text-sky-500 font-bold" strokeWidth={4} />
                   ) : null}
                </div>
                <span className="text-slate-800 font-extrabold text-xs select-none tracking-wide">
                   I'm not a robot
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-80">
                <Shield className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-[10px] font-extrabold text-slate-600">reCAPTCHA</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400 hover:from-sky-300 hover:to-blue-400 text-white py-2.5 sm:py-3 px-5 rounded-full font-extrabold text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-blue-950/40 hover:shadow-sky-400/50 border border-white/30 transition-all active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
               <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full"></span>
            ) : (
               <>
                 {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
                 <span className="text-lg leading-none">➔</span>
               </>
            )}
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative flex py-1.5 items-center my-1">
           <div className="flex-grow border-t border-white/30"></div>
           <span className="flex-shrink-0 mx-2.5 px-3 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/30 shadow-sm">
             OR
           </span>
           <div className="flex-grow border-t border-white/30"></div>
        </div>

        {/* Bottom Dual Pill Buttons (Demo Mode & Register/Sign In) */}
        <div className="grid grid-cols-2 gap-2.5 w-full pb-2">
          <button 
            type="button"
            onClick={() => {
              loginAsGuest('student');
              navigate('/dashboard', { state: { isDemoMode: true } });
            }}
            className="flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 text-white py-2.5 px-3 rounded-full font-extrabold text-xs transition-all shadow-md active:scale-95"
          >
            <PlayCircle className="w-4 h-4 text-sky-300" /> Demo Mode
          </button>

          <button 
            type="button"
            onClick={() => {
               setIsLogin(!isLogin);
               setError(null);
            }} 
            className="flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 text-white py-2.5 px-3 rounded-full font-extrabold text-xs transition-all shadow-md active:scale-95"
          >
            {isLogin ? (
              <><UserPlus className="w-4 h-4 text-sky-300" /> Register</>
            ) : (
              <><LogIn className="w-4 h-4 text-blue-300" /> Sign In</>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}

