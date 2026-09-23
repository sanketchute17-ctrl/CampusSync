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

      {/* 4. Floating Form Container (Crisp White Card with Navy Blue Theme) */}
      <div className="relative z-20 w-full max-w-[360px] sm:max-w-[400px] my-auto flex flex-col max-h-[95vh] overflow-y-auto [&::-webkit-scrollbar]:hidden p-5 sm:p-7 bg-white/95 backdrop-blur-2xl border border-white rounded-3xl shadow-2xl shadow-slate-950/40">
        
        {/* Branding Header & Role Switcher */}
        <div className="flex flex-col items-center mb-3 text-center">
          {/* 1. App Name & Logo AT THE TOP */}
          <div className="w-full flex items-center justify-center mb-1.5">
            <img src="/app-logo.png" alt="CampusSync Logo" className="h-9 sm:h-11 w-auto object-contain mr-2.5 drop-shadow" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wider uppercase border-b-2 border-blue-900 pb-0.5 inline-block">
              {displayText}
            </h1>
          </div>

          {/* 2. Tagline */}
          <p className="text-xs sm:text-sm text-blue-900 font-bold mb-3 tracking-wide">
            Connect, Learn & Share with Verified Campus Peers
          </p>

          {/* 3. Student & Faculty portal toggle */}
          <div className="flex bg-slate-100 p-1 rounded-full w-48 sm:w-56 justify-between relative border border-slate-300 shadow-inner">
            <div className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-blue-950 rounded-full transition-all duration-300 shadow-sm ${role === 'faculty' ? 'translate-x-[100%]' : 'translate-x-0'}`}></div>
            <button type="button" onClick={() => { setRole('student'); setError(null); }} className={`flex-1 py-1 text-xs z-10 transition-colors ${role === 'student' ? 'text-white font-black' : 'text-slate-600 font-bold hover:text-slate-900'}`}>Student</button>
            <button type="button" onClick={() => { setRole('faculty'); setError(null); }} className={`flex-1 py-1 text-xs z-10 transition-colors ${role === 'faculty' ? 'text-white font-black' : 'text-slate-600 font-bold hover:text-slate-900'}`}>Faculty</button>
          </div>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2 rounded-full mb-3 flex items-center gap-2 shadow-sm animate-in fade-in duration-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <p className="font-bold">{error.replace('Firebase:', '').trim()}</p>
          </div>
        )}

        {/* Form */}
        <form className="w-full flex justify-center flex-col gap-2.5" onSubmit={handleAuth}>
          {!isLogin && (
            <div className="space-y-2.5 animate-in slide-in-from-top-4 duration-300">
              <div className="relative w-full">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-900 pointer-events-none" />
                <input 
                  type="text" 
                  value={fullName} onChange={(e) => setFullName(e.target.value)} required={!isLogin}
                  placeholder="Full Name (e.g. Rahul Sharma)" 
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all font-bold text-xs shadow-sm"
                />
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={regNo} onChange={(e) => setRegNo(e.target.value)} required={!isLogin}
                  placeholder={role === 'faculty' ? "Employee ID" : "Reg No (EN21001)"} 
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all text-xs font-bold shadow-sm flex-1"
                />
                {role === 'student' && (
                  <input 
                    type="date" 
                    value={dob} onChange={(e) => setDob(e.target.value)} required={!isLogin}
                    className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-full text-slate-900 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all text-xs font-bold [color-scheme:light] shadow-sm flex-1"
                  />
                )}
              </div>

              {role === 'student' ? (
                <>
                  <div className="flex gap-2">
                    <select 
                      value={branch} onChange={(e) => setBranch(e.target.value)} required={!isLogin}
                      className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-full text-slate-900 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all text-xs font-bold shadow-sm flex-[2]">
                      <option value="" disabled className="text-slate-400">Select Branch</option>
                      <option value="CSE" className="text-slate-900">Computer Science (CSE)</option>
                      <option value="IT" className="text-slate-900">Information Tech (IT)</option>
                      <option value="MECH" className="text-slate-900">Mechanical (MECH)</option>
                      <option value="CIVIL" className="text-slate-900">Civil Engg (CIVIL)</option>
                      <option value="EXTC" className="text-slate-900">Electronics (EXTC)</option>
                      <option value="AI" className="text-slate-900">Artificial Intelligence (AI)</option>
                      <option value="AIML" className="text-slate-900">AI & Machine Learning (AIML)</option>
                      <option value="DS" className="text-slate-900">Data Science (DS)</option>
                    </select>

                    <select 
                      value={semester} onChange={(e) => setSemester(e.target.value)} required={!isLogin}
                      className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-full text-slate-900 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all text-xs font-bold shadow-sm flex-[1]">
                      <option value="" disabled className="text-slate-400">Sem</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s} className="text-slate-900">{s}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={startYear} onChange={(e) => setStartYear(e.target.value)} required={!isLogin}
                      placeholder="Start Year" min="2010" max="2030"
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all text-xs font-bold shadow-sm flex-1"
                    />
                    <input 
                      type="number" 
                      value={endYear} onChange={(e) => setEndYear(e.target.value)} required={!isLogin}
                      placeholder="End Year" min="2014" max="2034"
                      className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all text-xs font-bold shadow-sm flex-1"
                    />
                  </div>
                </>
              ) : (
                <select 
                  value={facultyDept} onChange={(e) => setFacultyDept(e.target.value)} required={!isLogin}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-full text-slate-900 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all text-xs font-bold shadow-sm">
                  <option value="" disabled className="text-slate-400">Select Department</option>
                  <option value="CSE" className="text-slate-900">Computer Science</option>
                  <option value="IT" className="text-slate-900">Information Technology</option>
                  <option value="MECH" className="text-slate-900">Mechanical Engineering</option>
                  <option value="CIVIL" className="text-slate-900">Civil Engineering</option>
                  <option value="EXTC" className="text-slate-900">Electronics & Telecom</option>
                  <option value="AI" className="text-slate-900">Artificial Intelligence</option>
                  <option value="AIML" className="text-slate-900">AI & Machine Learning</option>
                  <option value="DS" className="text-slate-900">Data Science</option>
                </select>
              )}
            </div>
          )}

          {/* Email Pill Input */}
          <div className="relative w-full">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-900 pointer-events-none" />
            <input 
              type="text" 
              value={emailOrReg} onChange={(e) => setEmailOrReg(e.target.value)} required
              placeholder="Enter your registered email" 
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all text-xs font-bold shadow-sm"
            />
          </div>

          {/* Password Pill Input */}
          <div className="relative w-full">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-900 pointer-events-none" />
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} onChange={(e) => setPassword(e.target.value)} required
              placeholder="Enter your password" 
              className="w-full pl-10 pr-10 py-2.5 bg-white border-2 border-slate-200 rounded-full text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20 transition-all text-xs font-bold shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-900 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot Password Link */}
          {isLogin && (
            <div className="flex justify-end w-full -mt-0.5">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-blue-900 hover:text-blue-950 font-extrabold text-xs transition-all hover:underline pr-1"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Captcha Section */}
          <div className="w-full mt-0.5">
            <div 
              className="flex items-center justify-between bg-slate-50 border-2 border-slate-200 rounded-2xl p-2.5 sm:px-4 cursor-pointer shadow-sm w-full hover:border-slate-300 transition-all"
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
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-blue-900 border-t-transparent rounded-full"></span>
                   ) : captchaVerified ? (
                      <Check className="w-4 h-4 text-blue-900 font-bold" strokeWidth={4} />
                   ) : null}
                </div>
                <span className="text-slate-800 font-extrabold text-xs select-none tracking-wide">
                   I'm not a robot
                </span>
              </div>
              <div className="flex items-center gap-1 opacity-80">
                <Shield className="w-3.5 h-3.5 text-blue-900" />
                <span className="text-[10px] font-extrabold text-slate-600">reCAPTCHA</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full flex items-center justify-center gap-2 bg-blue-950 hover:bg-blue-900 text-white py-3 px-5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg shadow-blue-950/30 transition-all active:scale-98 disabled:opacity-50"
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
        <div className="relative flex py-2 items-center my-1">
           <div className="flex-grow border-t border-slate-200"></div>
           <span className="flex-shrink-0 mx-2.5 px-3 py-0.5 bg-slate-100 rounded-full text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200 shadow-sm">
             OR
           </span>
           <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Bottom Dual Pill Buttons (Demo Mode & Register/Sign In) */}
        <div className="grid grid-cols-2 gap-2.5 w-full pb-1">
          <button 
            type="button"
            onClick={() => {
              loginAsGuest('student');
              navigate('/dashboard', { state: { isDemoMode: true } });
            }}
            className="flex items-center justify-center gap-1.5 bg-white border-2 border-blue-950 hover:bg-blue-50 text-blue-950 py-2.5 px-3 rounded-full font-extrabold text-xs transition-all shadow-sm active:scale-95"
          >
            <PlayCircle className="w-4 h-4 text-blue-900" /> Demo Mode
          </button>

          <button 
            type="button"
            onClick={() => {
               setIsLogin(!isLogin);
               setError(null);
            }} 
            className="flex items-center justify-center gap-1.5 bg-white border-2 border-blue-950 hover:bg-blue-50 text-blue-950 py-2.5 px-3 rounded-full font-extrabold text-xs transition-all shadow-sm active:scale-95"
          >
            {isLogin ? (
              <><UserPlus className="w-4 h-4 text-blue-900" /> Register</>
            ) : (
              <><LogIn className="w-4 h-4 text-blue-900" /> Sign In</>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}

