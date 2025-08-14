import { useState, useRef, useEffect } from "react";
import { MovingBackground } from "./HomeScreen";

export default function StartScreen({ setToken, requestOtp, verifyOtp }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("email"); // whether user is inputting email or otp
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [clickedIn, setClickedIn] = useState(false);
  const circleRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (circleRef.current) {
        const faqArea = document.querySelector('.faq-area');
        if (faqArea) {
          const faqRect = faqArea.getBoundingClientRect();
          
          // Calculate position relative to the FAQ area
          const x = e.clientX - faqRect.left;
          const y = e.clientY - faqRect.top;
          
          // Only show circle when mouse is within FAQ area
          if (x >= 0 && x <= faqRect.width && y >= 0 && y <= faqRect.height) {
            circleRef.current.style.display = 'block';
            circleRef.current.style.left = `${x}px`;
            circleRef.current.style.top = `${y}px`;
          } else {
            circleRef.current.style.display = 'none';
          }
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const onRequest = async () => {
    if (!requestOtp) return;
    setLoading(true);
    setMessage("");
    const result = await requestOtp(email);
    if (result?.ok) {
      setStage("otp");
      setMessage("Code sent. Check your email.");
    } else {
      setMessage(result?.message || "Failed to request code.");
    }
    setLoading(false);
  };

  const onVerify = async () => {
    if (!verifyOtp) return;
    setLoading(true);
    setMessage("");
    const result = await verifyOtp(email, otp);
    if (result?.ok && result?.token) {
      setToken?.(result.token);
    } else {
      setMessage(result?.message || "Invalid code.");
    }
    setLoading(false);
  };

  return (


    
    

    <div className="start-screen">

      <div className="opening" style={{
        width: "100vw",
        minHeight: "100vh",
        position: "relative",
        backgroundImage: "url('/landing/background.png')",
        backgroundSize: "contain",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
        
      }}>


        <div className="opening-info" style={{
          top: "0",
          zIndex: 2,
        }}>
          <p className="top-text japanese black-outline">ハッククラブ：ゲームを作って、日本にアーケードを建てよう。</p>
          <p className="top-text english black-outline">HACK CLUB: make a game, build an arcade in japan.</p>
          <img src="/landing/shibaarcade_logo.png" style={{
            width: "60%",
            zIndex: 2,
          }} />

        <iframe className="opening-video"  src="https://www.youtube.com/embed/ehH_52fzStw?si=FMBsR4wvCLBPr02p" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
          
        
        
        <div className="email-input" style={{
                marginTop: "-20px",
        }}>
          {stage === "email" ? (
            <>
             <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="orpheus@hackclub.com"
      />
      <button onClick={onRequest} disabled={loading}>join the jam</button>
            </>
          ): (
            <>
             <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                inputMode="numeric"
                maxLength={6}
              />
              <button onClick={onVerify} disabled={loading}>verify</button>
            </>
          )}
       
      </div>

        </div>
      </div>

      <div className="info-screen">

        <div className="info info-1">

          <div className="background">
            <div className="moving-background"><MovingBackground /></div>
            <div className="info-screen-overlay"></div>
          </div>

          <div className="content">
            <div className="firetext online"><p>online!</p></div>
            <h1>MAKE A GAME<br/>for 2 months</h1>
            <p>godot and stuff. godot and stuff.godot and stuff. godot and stuff.godot and stuff. godot and stuff.godot and stuff. godot and stuff.godot and stuff. godot and stuff.</p>

          </div>


        </div>

        <div className="taiko-divider">
        <img  src="/landing/taiko_divider.png"></img>
          <div className="jumpy">
            <div className="jumpy-item" style={{
            animationDelay: "0s",
          }}>
            <img src="/landing/jumpy1.png" />
            <p>GO</p>

            </div>

            <div className="jumpy-item" style={{
            animationDelay: "0.3s",
          }}>
            <img src="/landing/jumpy2.png" />
            <p>TO</p>

            </div>

            <div className="jumpy-item" style={{
            animationDelay: "0.6s",
          }}>
            <img src="/landing/jumpy3.png" />
            <p>TO-</p>

            </div>

            <div className="jumpy-item" style={{
            animationDelay: "0.9s",
          }}>
            <img src="/landing/jumpy4.png" />
            <p>KYO!</p>

            </div>

          </div>
        </div>

        <div className="info info-2">

          <div className="background">
            <div className="moving-background"><MovingBackground /></div>
          </div>

          <div className="content">
            <div className="firetext flipped inperson"><p>in-person!</p></div>
            <h1>build an arcade<br/>IN TOKYO JAPAN</h1>
            <p>godot and stuff. godot and stuff.godot and stuff. godot and stuff.godot and stuff. godot and stuff.godot and stuff. godot and stuff.godot and stuff. godot and stuff.</p>

          </div>


      </div>

      <img src="/landing/arcade_divider.png" className="arcade-divider" />


     


             <div className="faq-area">
       <div className="faq-background"></div>
       <div className="purple-circle" ref={circleRef}></div>
       <div className="faq-gradient-overlay"></div> 


       <div className="signup">

        <p className="top-text english">HACK CLUB: sign up now.</p>
           <div className="email-input">
          {stage === "email" ? (
            <>
             <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="orpheus@hackclub.com"
            />
        <button onClick={onRequest} disabled={loading}>join the jam</button>
              </>
            ): (
              <>
              <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  inputMode="numeric"
                  maxLength={6}
                />
                <button onClick={onVerify} disabled={loading}>verify</button>
              </>
            )}
        
        </div>

        <p className="top-text english">jam starts in ?d ?h ?m ?s</p>

      </div>

      <div className="faq">
        <div className="shiba-direct">
            <img src="/landing/shiba_direct.png" />
          <p>22 august · ?pm–?pm PST</p>
          <p>get LIVE shiba news and the latest information.</p>
          <p>sign up to rsvp.</p>

        </div>

        <details>
          <summary>can i participate?</summary>
          <p>shiba is for teenagers 18 years old and under!</p>
        </details>


        <details>
          <summary>how long will shiba run for?</summary>
          <p>shiba starts on august 22 and ends on october 20. then, we'll build an arcade in tokyo from november 1-7th.</p>
        </details>

        <details>
          <summary>i don't know how to make games!</summary>
          <p>don't worry, beginners are welcome! we will run workshops to teach you how to make games in godot. you will also get plenty of feedback about your games and get the chance to make multiple :)</p>
        </details>

      </div>
      </div>
      </div>


    <style jsx>{`

      .start-screen {
        background-color: black;
        width: 100vw;
        height: 100%;
        font-size: 1.2em;
      }
      
      .opening-info {
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100vh;
        padding: 20px;
      }

      .top-text {
      color: white;
      font-weight: bold;
      }

      .top-text.japanese {
        color: white;
      }
      
      .top-text.english {
        color: var(--yellow);
        font-style: italic;
      }

      .opening-video {
      width: 65%;
      aspect-ratio: 16/9;
      border-radius: 32px;
      border: 3px solid var(--yellow);
      margin-top: -35px;
      }


      .black-outline {
        text-shadow:
          -1px 0 0 #000,
          1px 0 0 #000,
          0 -1px 0 #000,
          0 1px 0 #000
      }
      

      .email-input {
      border: 3px solid var(--yellow);
      border-radius: 24px;
      padding: 15px;
      width: 45%;
      font-weight: bold;
      font-style: italic;

      background-color: black;
      background: linear-gradient(to bottom, #2B2B2B, #4C2E19);

      font-size: 1.2em;

      display: flex;
      
      }

      .email-input * {
      font-size: inherit;
      font-family: inherit;
      font-weight: inherit;
      font-style: inherit;
      }

      .email-input input {
      outline: none;
      border: none;
      background-color: transparent;
      color: white;
      width: 100%;
      }

      .email-input button {
      outline: none;
      border: none;
      background-color: var(--purple);
      color: white;
      border-radius: 12px;
      padding: 10px;
      width: inherit;
      }

      .email-input button:hover {
        background-color: #A30095;
      }




      .firetext {
        border-image-slice: 49 285 57 52 fill;
        border-image-source: url('/landing/firetext.png');
        border-image-width: 20px 50% 20px 20px;;
        border-image-repeat: stretch stretch;
        border-image-outset: 0px 100px 0px 0px;
        padding: 20px;
        padding-right: 60px;
  
        color: black;
        font-weight: bold;
        font-style: italic;
        font-size: 2em;
        width: fit-content;

        }
  



      .info-screen {
      position: relative;
      height: 100%;
      }

      .info {
      position: relative;
      height: fit-content;
      }

      .info h1, .info p {
        color: white;
        font-weight: bold;
        padding-left: 48px;
        padding-right: 48px;
      }

      .info h1 {
      font-size: 4em;
      font-style: italic;
      }

    
      
      .info-screen .background {
      position: absolute;
      height: 100%;
      background-color:rgb(78, 138, 221);
      width: 100%;
      }

      .moving-background {
      opacity: 0.3;
      }

      .info-screen .info-screen-overlay {
      position: absolute;
      top: 0;
      height: 200px;
      width: 100%;
      background: linear-gradient(to bottom, black, transparent);
      }

      .info-screen .content {
      position: relative;
      z-index: 10;
      width: 100%;
      height: fit-content;
      padding: 64px;

      }

      .info-1 .content {
          padding-bottom: 12.5vw;
        margin-bottom: -19.5vw;
        padding-right: 35%;
      }

      .taiko-divider {
      position: relative;
      width: 100%;
      z-index: 5;
      }

      .taiko-divider img {
        width: 100%;
      }

      .jumpy {
      position: absolute;
      top: 12.2vw;
      display: flex;
      flex-flow: row;
      align-items: center;
      justify-content: center;
      gap: 5%;
      width: 100%;

      transform: rotate(-10.42deg);
      padding: 0 15%;
      color: white;
      }

      .jumpy-item {
        animation: jumpUp 2s infinite;
      }

      .jumpy p {
      text-align: center;
      
      font-weight: bold;
      font-size: 2em;

      margin-top: -50px;
      position: relative;
      z-index: 10;

      text-shadow:
          -3.5px 0 0 #000,
          3.5px 0 0 #000,
          0 -3.5px 0 #000,
          0 3.5px 0 #000,
          -3.5px -3.5px 0 #000,
          3.5px -3.5px 0 #000,
          -3.5px 3.5px 0 #000,
          3.5px 3.5px 0 #000
      }

      .jumpy img {
      width: 100%;
      filter: drop-shadow(4px 4px 4px rgba(0, 0, 0, 0.5));
      }

      @keyframes jumpUp {
        0% {
          transform: translateY(0);
          color: white;
        }
        15% {
            transform: translateY(-10px);
            color: var(--yellow);
          }
        30% {
          transform: translateY(0);
          color: white;
        }
        100% {
          transform: translateY(0);
        }
      }



      .info-2 .content {
      padding-top: 10.5vw;
      margin-top: -19.5vw;
      display: flex;
      flex-flow: column;
      align-items: flex-end;
      justify-content: flex-end;
      text-align: right;

      padding-bottom: 22.5vw;
        margin-bottom: -19.5vw;

        padding-left: 25%;
      }

      .info-screen .info-2 .background {
        background-color:rgb(197, 121, 209);
      }

    .firetext.flipped {
        -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
      }

      .firetext.flipped p {
      -webkit-transform: scaleX(-1);
      transform: scaleX(-1);
      text-align: right;
      }


      .firetext p {
        color: black;
        text-align: left;
        margin: 0;
        padding: 0;
      }

      .arcade-divider {
          width: 110%;
          margin-left: -5%;
          position: relative;
          z-index: 2;
         filter: drop-shadow(4px 4px 4px rgba(0, 0, 0, 0.5));

      }


      .signup {
        width: 100%;
        padding: 180px 20px 240px;
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 20px;
        position: relative;
        z-index: 15;
      }

      .faq-area {
      position: relative;
      overflow: hidden;
      padding-bottom: 80px;
      }


      .faq-background {
      background-color: black;
      background-image: 
        url('/landing/shiba.png');
      background-size: 60px;
      width: 100%;
      height: 100%;
      position: absolute;
      z-index: 1;
      opacity: 0.2;
      }

      .faq-gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, black 0%, transparent 50%);
      z-index: 3;
      }

      .purple-circle {
        position: absolute;
        width: 250px;
        height: 250px;
        background: radial-gradient(circle, rgba(128, 0, 255, 1.0) 5%, #BA7DCC88 30%, transparent 80%);
        border-radius: 50%;
        pointer-events: none;
        mix-blend-mode: color-dodge;
        z-index: 2;
        transform: translate(-50%, -50%);
        display: none;
      }

      .faq {
      position: relative;
      z-index: 10;
      border: 2px solid white;
      border-radius: 32px;
      margin: 0 10%;
      padding: 24px;
      display: flex;
      flex-flow: column;
      align-items: stretch;
      gap: 20px;
      background-color: black;
      }

      .shiba-direct {
        border: 4px solid var(--red);
        border-radius: 8px;
        background: linear-gradient(to bottom, white, #ED7874);
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 8px;
        padding: 16px;
      }

      .shiba-direct p {
      font-weight: bold;
      }

      .shiba-direct img {
      width: 80%;
      margin-bottom: 8px;
      }

      .faq details {
      color: black;
      padding: 20px;
      background-color: white;
      border-radius: 8px;
      border: 4px solid white;
      background: linear-gradient(to bottom, white, #f7b748);
      }

      .faq summary {
      font-weight: bold;
      
      }

      `}</style>
    </div>
  );
}
