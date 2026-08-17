"use client";

import { useEffect } from "react";

export default function CorpoLandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".fade-in-up").forEach((el) => observer.observe(el));

    const header = document.getElementById("header");
    const mainLogo = document.getElementById("main-logo");
    const desktopNav = document.getElementById("desktop-nav-links");

    const onScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add("header-scrolled");
        mainLogo?.classList.remove("logo-white");
        desktopNav?.classList.remove("text-white");
        desktopNav?.classList.add("text-dark");
      } else {
        header.classList.remove("header-scrolled");
        mainLogo?.classList.add("logo-white");
        desktopNav?.classList.add("text-white");
        desktopNav?.classList.remove("text-dark");
      }
    };
    window.addEventListener("scroll", onScroll);
    onScroll();

    const menuBtn = document.getElementById("menu-btn");
    const menu = document.getElementById("mobile-menu");
    const toggleMenu = () => {
      header.classList.toggle("menu-open");
      menu.classList.toggle("hidden");
      setTimeout(() => menu.classList.toggle("opacity-0"), 10);
      document.body.classList.toggle("overflow-hidden");
    };
    menuBtn?.addEventListener("click", toggleMenu);
    menu?.querySelectorAll("a").forEach((l) => l.addEventListener("click", toggleMenu));

    document.querySelectorAll(".accordion-item").forEach((item) => {
      item.querySelector(".accordion-header")?.addEventListener("click", () => {
        const active = document.querySelector(".accordion-item.active");
        if (active && active !== item) active.classList.remove("active");
        item.classList.toggle("active");
      });
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  const whatsappLink =
    "https://wa.me/+5541997850163?text=Ol%C3%A1%2C%20tenho%20interesse%20nos%20protocolos%20corporais%20e%20gostaria%20de%20maiores%20informa%C3%A7%C3%B5es.";

  const WhatsAppIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Inter:wght@200;300;400;500;600&display=swap');

        :root {
          --bg-dark: #003238;
          --bg-light: #EFF4F4;
          --text-light: #FFFFFF;
          --text-dark: #003238;
          --accent: #00A5B6;
          --accent-light: #00B9C9;
          --whatsapp: #2FE965;
        }

        * { -webkit-tap-highlight-color: transparent !important; box-sizing: border-box; }

        body {
          font-family: 'Inter', sans-serif;
          font-weight: 300;
          background-color: var(--bg-light);
          color: var(--text-dark);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          margin: 0; padding: 0;
          overflow-x: hidden;
        }

        h1, h2, h3, h4, h5, h6 { font-family: 'Cormorant Garamond', serif; letter-spacing: -0.02em; }
        button:focus, a:focus { outline: none !important; }

        .fade-in-up {
          opacity: 0; transform: translateY(40px);
          transition: opacity 1.2s cubic-bezier(0.165,0.84,0.44,1), transform 1.2s cubic-bezier(0.165,0.84,0.44,1);
        }
        .fade-in-up.visible { opacity: 1; transform: translateY(0); }

        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .ticker-track { animation: ticker 45s linear infinite; }

        .accordion-content {
          max-height: 0; overflow: hidden; opacity: 0;
          transition: max-height 0.7s cubic-bezier(0.165,0.84,0.44,1), opacity 0.5s ease, padding 0.5s ease;
        }
        .accordion-item.active .accordion-content {
          max-height: 2000px; opacity: 1; padding-top: 1rem; padding-bottom: 2rem;
          transition: max-height 1s cubic-bezier(0.165,0.84,0.44,1), opacity 0.7s ease, padding 0.5s ease;
        }
        .accordion-item .icon-plus { transform: rotate(0deg); transition: transform 0.6s cubic-bezier(0.165,0.84,0.44,1); }
        .accordion-item.active .icon-plus { transform: rotate(45deg); }

        .accordion-header,
        .accordion-header:focus, .accordion-header:active, .accordion-header:hover {
          background: transparent !important; border: none !important;
          outline: none !important; box-shadow: none !important;
        }

        .glass-dark {
          background: rgba(0,50,56,0.4); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,0.05);
        }
        .glass-light {
          background: rgba(255,255,255,0.6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0,165,182,0.1);
        }

        .logo-white { filter: brightness(0) invert(1); }

        #main-logo { max-height: 44px; width: auto; max-width: 150px; object-fit: contain; }
        @media (min-width: 768px) { #main-logo { max-height: 52px; max-width: 190px; } }
        .footer-logo-img { max-height: 38px; width: auto; max-width: 170px; object-fit: contain; }

        #header { position: fixed; top: 0; left: 0; width: 100%; z-index: 50; transition: all 0.7s; padding: 0.5rem 0; border-bottom: 1px solid transparent; }
        .header-scrolled { background: rgba(239,244,244,0.92) !important; backdrop-filter: blur(20px) !important; -webkit-backdrop-filter: blur(20px) !important; border-bottom-color: rgba(0,165,182,0.1) !important; }
        .header-scrolled .line-top, .header-scrolled .line-bottom { background-color: var(--bg-dark) !important; }

        .text-white { color: #fff; }
        .text-dark { color: var(--text-dark); }

        .menu-open .line-top { transform: rotate(45deg) translateY(6px) translateX(6px); background-color: var(--accent) !important; }
        .menu-open .line-bottom { transform: rotate(-45deg) translateY(-6px) translateX(6px); background-color: var(--accent) !important; }

        .btn-whatsapp {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.75rem;
          background: var(--whatsapp); color: #003238; font-weight: 500;
          letter-spacing: 0.05em; font-size: 0.75rem;
          padding: 1rem 2rem; border-radius: 9999px;
          transition: all 0.5s; overflow: hidden; text-decoration: none;
          width: 100%; max-width: 400px;
        }
        @media (min-width: 640px) { .btn-whatsapp { width: auto; max-width: none; font-size: 0.8125rem; padding: 1.1rem 2.5rem; } }
        .btn-whatsapp:hover { box-shadow: 0 0 30px rgba(47,233,101,0.4); transform: scale(1.03); }

        .btn-outline {
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid var(--whatsapp); color: var(--whatsapp);
          font-weight: 400; letter-spacing: 0.08em; text-transform: uppercase;
          font-size: 0.7rem; padding: 0.75rem 1.5rem; border-radius: 9999px;
          transition: all 0.5s; text-decoration: none;
        }
        .btn-outline:hover { background: var(--whatsapp); color: var(--bg-dark); }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--bg-light); }
        ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 10px; }

        .container { max-width: 1200px; margin: 0 auto; padding-left: 1.5rem; padding-right: 1.5rem; }
      `}</style>

      {/* HEADER */}
      <header id="header">
        <nav className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 1.5rem" }}>
          <a href="#" style={{ display: "block" }}>
            <img
              src="https://clinica.esteticalosangeles.com.br/wp-content/uploads/2026/03/LOGO-BG.png"
              alt="Logo Estética Los Angeles"
              id="main-logo"
              className="logo-white"
              style={{ transition: "all 0.5s" }}
            />
          </a>

          <div id="desktop-nav-links" className="text-white" style={{
            display: "none", alignItems: "center", gap: "2.5rem",
            fontWeight: 300, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase",
          }}>
            {["Queixas", "Protocolos", "Tecnologias", "Dúvidas"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"")}`}
                style={{ textDecoration: "none", color: "inherit", transition: "color 0.3s" }}
                onMouseEnter={(e) => e.target.style.color = "var(--accent)"}
                onMouseLeave={(e) => e.target.style.color = "inherit"}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: "none" }} className="desktop-cta">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-outline">
              Agendar Avaliação
            </a>
          </div>

          <button id="menu-btn" className="mobile-menu-btn" style={{
            display: "block", background: "transparent", border: "none", cursor: "pointer",
            position: "relative", width: "24px", height: "24px", zIndex: 50,
          }} aria-label="Menu">
            <span className="line-top" style={{
              position: "absolute", top: "4px", left: 0, width: "24px", height: "1px",
              background: "#fff", transition: "all 0.5s"
            }}></span>
            <span className="line-bottom" style={{
              position: "absolute", top: "14px", left: 0, width: "24px", height: "1px",
              background: "#fff", transition: "all 0.5s"
            }}></span>
          </button>
        </nav>

        <div id="mobile-menu" className="hidden opacity-0" style={{
          position: "fixed", inset: 0, zIndex: 40, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "rgba(0,50,56,0.96)", backdropFilter: "blur(20px)", transition: "opacity 0.5s",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 300, fontSize: "1.1rem" }}>
            {[["#queixas","Queixas"],["#protocolos","Protocolos"],["#tecnologias","Tecnologias"],["#duvidas","Dúvidas"]].map(([href,label]) => (
              <a key={label} href={href} style={{ color: "#fff", textDecoration: "none" }}>{label}</a>
            ))}
            <div style={{ paddingTop: "2rem" }}>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: "1rem 2rem" }}>
                Agendar Avaliação
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop breakpoint styles */}
      <style>{`
        @media (min-width: 1024px) {
          #desktop-nav-links { display: flex !important; }
          .desktop-cta { display: block !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>

      {/* HERO */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(to bottom, rgba(0,50,56,0.92), rgba(0,50,56,0.75), rgba(0,50,56,0.5))",
        }}></div>
        <img
          src="https://clinica.esteticalosangeles.com.br/wp-content/uploads/2026/03/Topo-bronzeamento_Prancheta-1-estetica-los-angeles-scaled-1.jpg"
          alt="Corpo feminino tratado"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />

        <div className="container" style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "6rem 1.5rem 4rem" }}>
          <div className="fade-in-up" style={{ maxWidth: "700px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem", opacity: 0.8 }}>
              <div style={{ height: "1px", width: "2rem", background: "var(--accent)" }}></div>
              <span style={{ color: "var(--accent)", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.65rem" }}>Los Angeles Estética e Bem-Estar</span>
              <div style={{ height: "1px", width: "2rem", background: "var(--accent)" }}></div>
            </div>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "clamp(2.2rem, 6vw, 4rem)", lineHeight: 1.1,
              color: "#fff", marginBottom: "1.5rem",
            }}>
              Seu corpo de verão começa <i style={{ color: "var(--accent-light)" }}>aqui.</i>
            </h1>

            <p style={{
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)", fontWeight: 300,
              color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: "1rem",
            }}>
              Protocolos personalizados para gordura localizada, flacidez e celulite.
              <br />Combinando diferentes tecnologias de acordo com os seus objetivos.
            </p>

            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "var(--accent-light)",
              marginBottom: "2.5rem",
            }}>
              Cuide do seu corpo com um protocolo pensado para você.
            </p>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                <WhatsAppIcon />
                AGENDAR MINHA AVALIAÇÃO
              </a>
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>
                Av. Sete de Setembro, 6490 - Batel, Curitiba
              </span>
            </div>
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
          zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.5,
        }}>
          <span style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 300, marginBottom: "0.5rem", color: "#fff" }}>Scroll</span>
          <div style={{ width: "1px", height: "2rem", background: "var(--accent)" }}></div>
        </div>
      </section>

      {/* TICKER */}
      <section style={{
        background: "var(--bg-light)", padding: "1rem 0",
        borderBottom: "1px solid rgba(0,165,182,0.1)", overflow: "hidden",
      }}>
        <div className="ticker-track" style={{ display: "flex", whiteSpace: "nowrap", opacity: 0.6 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "2.5rem", padding: "0 2rem",
            fontSize: "0.7rem", letterSpacing: "0.2em", fontWeight: 300, textTransform: "uppercase",
          }}>
            {["Gordura Localizada","Flacidez","Celulite","Protocolos Personalizados","Contorno Corporal","CmSlim","Vela Shape","Exilis","Gordura Localizada","Flacidez","Celulite","Protocolos Personalizados","Contorno Corporal","CmSlim","Vela Shape","Exilis"].map((t,i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "2.5rem" }}>
                <span>{t}</span>
                <span style={{ color: "var(--accent)" }}>&bull;</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* QUEIXAS - 3 CARDS */}
      <section id="queixas" style={{ padding: "clamp(4rem,8vw,8rem) 0", background: "var(--bg-light)" }}>
        <div className="container" style={{ maxWidth: "1000px" }}>
          <div className="fade-in-up" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ color: "var(--accent)", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.65rem", display: "block", marginBottom: "0.75rem" }}>Diagnóstico</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.8rem,4vw,3rem)", lineHeight: 1.2 }}>
              Qual é a sua queixa?
            </h2>
            <div style={{ width: "3rem", height: "1px", background: "var(--accent)", margin: "1.5rem auto 0" }}></div>
          </div>

          <div className="fade-in-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[
              { num: "01", title: "Gordura Localizada", desc: "Aquela gordura que permanece mesmo com alimentação equilibrada e rotina de exercícios." },
              { num: "02", title: "Flacidez", desc: "Perda de firmeza e sustentação que pode deixar a pele com aspecto menos uniforme." },
              { num: "03", title: "Celulite", desc: "Alterações na aparência da pele que podem incomodar e afetar sua confiança." },
            ].map((item) => (
              <div key={item.num} className="glass-light" style={{
                padding: "2rem", textAlign: "center",
                borderTop: "3px solid var(--accent)", transition: "all 0.5s",
              }}>
                <div style={{
                  width: "3rem", height: "3rem", borderRadius: "50%", border: "1px solid var(--accent)",
                  display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem",
                  color: "var(--accent)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem",
                }}>
                  {item.num}
                </div>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: 400, marginBottom: "0.75rem" }}>{item.title}</h3>
                <p style={{ fontWeight: 300, fontSize: "0.85rem", lineHeight: 1.7, opacity: 0.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="fade-in-up" style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontSize: "clamp(1rem,2.5vw,1.3rem)", color: "var(--accent)", fontWeight: 400,
            }}>
              Cada corpo tem uma necessidade diferente. O tratamento também deve ter.
            </p>
          </div>
        </div>
      </section>

      {/* PROTOCOLOS */}
      <section id="protocolos" style={{ padding: "clamp(4rem,8vw,8rem) 0", background: "var(--bg-dark)", color: "#fff" }}>
        <div className="container" style={{ maxWidth: "1100px" }}>
          <div className="fade-in-up" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ color: "var(--accent-light)", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.65rem", display: "block", marginBottom: "0.75rem" }}>Protocolos de Verão</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.8rem,4vw,3rem)", lineHeight: 1.2, color: "#fff" }}>
              Conheça algumas das nossas opções
            </h2>
            <div style={{ width: "3rem", height: "1px", background: "var(--accent-light)", margin: "1.5rem auto 0" }}></div>
          </div>

          <div className="fade-in-up" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {[
              { name: "Brisa do Verão", sessions: "12 sessões", tech: "3 tecnologias", desc: "Foco no cuidado corporal completo." },
              { name: "Beira Mar", sessions: "10 sessões", tech: "2 tecnologias", desc: "Combinação de tratamentos para diferentes necessidades corporais." },
              { name: "Onda de Frescor", sessions: "12 sessões", tech: "tecnologias combinadas", desc: "Uma proposta completa para cuidado corporal." },
            ].map((p, i) => (
              <div key={i} className="glass-dark" style={{
                padding: "2.5rem 2rem", borderRadius: "1rem", position: "relative",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                transition: "all 0.5s",
              }}>
                <div>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif", fontSize: "1.6rem", fontWeight: 400,
                    color: "var(--accent-light)", marginBottom: "1.25rem",
                  }}>{p.name}</h3>
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "0.7rem", letterSpacing: "0.1em", padding: "0.4rem 0.8rem",
                      border: "1px solid rgba(255,255,255,0.15)", borderRadius: "9999px",
                      color: "rgba(255,255,255,0.7)",
                    }}>{p.sessions}</span>
                    <span style={{
                      fontSize: "0.7rem", letterSpacing: "0.1em", padding: "0.4rem 0.8rem",
                      border: "1px solid rgba(255,255,255,0.15)", borderRadius: "9999px",
                      color: "rgba(255,255,255,0.7)",
                    }}>{p.tech}</span>
                  </div>
                  <p style={{ fontWeight: 300, fontSize: "0.85rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="fade-in-up" style={{ textAlign: "center", marginTop: "3rem" }}>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <WhatsAppIcon />
              VER OPÇÕES E CONDIÇÕES
            </a>
          </div>
        </div>
      </section>

      {/* TECNOLOGIAS */}
      <section id="tecnologias" style={{ padding: "clamp(4rem,8vw,8rem) 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "1000px" }}>
          <div className="fade-in-up" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ color: "var(--accent)", fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.65rem", display: "block", marginBottom: "0.75rem" }}>Arsenal Tecnológico</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.8rem,4vw,3rem)", lineHeight: 1.2 }}>
              Tecnologias combinadas para diferentes objetivos
            </h2>
            <div style={{ width: "3rem", height: "1px", background: "var(--accent)", margin: "1.5rem auto 0" }}></div>
            <p style={{ fontWeight: 300, fontSize: "0.9rem", color: "rgba(0,50,56,0.6)", marginTop: "1rem", maxWidth: "600px", margin: "1rem auto 0" }}>
              Dependendo da avaliação e do objetivo, os protocolos podem combinar tecnologias como:
            </p>
          </div>

          <div className="fade-in-up" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem",
            maxWidth: "800px", margin: "0 auto",
          }}>
            {["CmSlim", "Vela Shape", "Cellutec", "Exilis", "Legacy", "Transform X", "Enzimas"].map((tech, i) => (
              <div key={i} className="glass-light" style={{
                padding: "1.5rem 1rem", textAlign: "center", borderRadius: "0.75rem",
                transition: "all 0.4s", cursor: "default",
              }}>
                <span style={{ color: "var(--accent)", fontWeight: 400, fontSize: "0.85rem" }}>{tech}</span>
              </div>
            ))}
          </div>

          <div className="fade-in-up" style={{ textAlign: "center", marginTop: "2rem" }}>
            <p style={{
              fontWeight: 300, fontStyle: "italic", fontSize: "0.8rem",
              color: "rgba(0,50,56,0.5)", maxWidth: "500px", margin: "0 auto",
            }}>
              A indicação da tecnologia e da combinação de tratamentos é realizada de acordo com a avaliação e as necessidades individuais.
            </p>
          </div>
        </div>
      </section>

      {/* CTA INTERMEDIÁRIO */}
      <section style={{
        padding: "clamp(4rem,8vw,7rem) 0", position: "relative", overflow: "hidden",
        background: "var(--bg-dark)",
      }}>
        <div style={{
          position: "absolute", top: 0, right: 0, width: "400px", height: "400px",
          background: "var(--accent)", borderRadius: "50%", filter: "blur(120px)", opacity: 0.08,
        }}></div>

        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          <div className="fade-in-up" style={{ maxWidth: "650px", margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif", fontWeight: 300,
              fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1.15, color: "#fff",
              marginBottom: "1.5rem",
            }}>
              Pronta para começar seu <i style={{ color: "var(--accent-light)" }}>projeto de verão?</i>
            </h2>
            <p style={{
              fontWeight: 300, fontSize: "clamp(0.85rem,2vw,1rem)", color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7, marginBottom: "2rem",
            }}>
              Cuide da gordura localizada, flacidez, celulite e do contorno corporal com um protocolo personalizado para as suas necessidades.
            </p>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
              fontSize: "clamp(1rem,2.5vw,1.2rem)", color: "var(--accent-light)",
              marginBottom: "2.5rem",
            }}>
              Fale com a Los Angeles Estética e Bem-Estar e descubra as opções disponíveis.
            </p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <WhatsAppIcon />
              QUERO CONHECER MEU PROTOCOLO
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="duvidas" style={{ padding: "clamp(4rem,8vw,8rem) 0", background: "#fff" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="fade-in-up" style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.8rem,4vw,3rem)" }}>
              Transparência Total
            </h2>
            <div style={{ width: "3rem", height: "1px", background: "var(--accent)", margin: "1rem auto 0.75rem" }}></div>
            <p style={{ fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.6rem", color: "rgba(0,50,56,0.5)" }}>Perguntas Frequentes</p>
          </div>

          <div className="fade-in-up">
            {[
              { q: "Qual protocolo é indicado para gordura localizada?", a: "A indicação depende da avaliação e das características de cada pessoa. A clínica trabalha com diferentes tecnologias e combinações que podem ser utilizadas em protocolos corporais personalizados." },
              { q: "Vocês têm tratamento para flacidez?", a: "Sim. Existem diferentes tecnologias e combinações voltadas ao cuidado com a firmeza e a qualidade da pele. A melhor opção é definida após avaliação." },
              { q: "Existe tratamento para celulite?", a: "Sim. A clínica possui diferentes recursos que podem ser utilizados em protocolos direcionados ao cuidado com a aparência da celulite, de acordo com cada caso." },
              { q: "Preciso fazer vários tratamentos?", a: "Não necessariamente. A quantidade e a combinação de sessões dependem do protocolo indicado para o seu objetivo." },
              { q: "Os protocolos são personalizados?", a: "Sim. A proposta é avaliar suas necessidades e objetivos para definir a combinação de tratamentos mais adequada." },
              { q: "Onde fica a Los Angeles Estética e Bem-Estar?", a: "Estamos na Avenida Sete de Setembro, 6490 – Batel, Curitiba." },
              { q: "Como faço para saber qual protocolo é indicado para mim?", a: "Clique no botão de contato e fale com nossa equipe para solicitar informações e agendar sua avaliação." },
            ].map((faq, i) => (
              <div key={i} className="accordion-item" style={{ borderBottom: "1px solid rgba(0,165,182,0.2)" }}>
                <button type="button" className="accordion-header" style={{
                  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                  textAlign: "left", padding: "1.25rem 0", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "inherit", color: "inherit",
                }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(1rem,2.5vw,1.35rem)", flex: 1, paddingRight: "1.5rem", lineHeight: 1.3,
                  }}>{faq.q}</span>
                  <span className="icon-plus" style={{ fontSize: "1.5rem", color: "var(--accent)", flexShrink: 0, fontWeight: 200 }}>+</span>
                </button>
                <div className="accordion-content" style={{ paddingLeft: 0, paddingRight: 0 }}>
                  <p style={{ fontWeight: 300, fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(0,50,56,0.6)" }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="fade-in-up" style={{ textAlign: "center", marginTop: "3rem" }}>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              <WhatsAppIcon />
              AGENDAR AVALIAÇÃO
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#001f23", color: "#fff", paddingTop: "4rem", paddingBottom: "2rem", borderTop: "1px solid var(--bg-dark)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2.5rem", textAlign: "center", marginBottom: "3rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src="https://clinica.esteticalosangeles.com.br/wp-content/uploads/2026/03/LOGO-BG.png" alt="Logo" className="footer-logo-img logo-white" style={{ opacity: 0.7, marginBottom: "1rem" }} />
              <p style={{ fontWeight: 300, color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", lineHeight: 1.7 }}>
                Beleza que transcende o tempo.<br />Ética, precisão e arte desde 1981.
              </p>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--accent-light)", fontSize: "1.1rem", marginBottom: "1rem" }}>Localização</h4>
              <p style={{ fontWeight: 300, color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", lineHeight: 1.7 }}>Av. 7 de Setembro, 6490<br />Batel, Curitiba - PR</p>
            </div>
            <div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", color: "var(--accent-light)", fontSize: "1.1rem", marginBottom: "1rem" }}>Contato</h4>
              <p style={{ fontWeight: 300, color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>WhatsApp: (41) 99785-0163</p>
              <p style={{ fontWeight: 300, color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>Fixo: (41) 3026-6164</p>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem", textAlign: "center" }}>
            <p style={{ fontWeight: 300, color: "rgba(255,255,255,0.3)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              &copy; 2026 Estética Los Angeles. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* FLOATING WHATSAPP BUTTON - MOBILE */}
      <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{
        position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 40,
        width: "56px", height: "56px", borderRadius: "50%",
        background: "var(--whatsapp)", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(47,233,101,0.4)", transition: "transform 0.3s",
        color: "#003238", textDecoration: "none",
      }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
          <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
        </svg>
      </a>
    </>
  );
}
