"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { FormEvent, MouseEvent as ReactMouseEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import aithosLoginLogo from "@/assets/aithos-login-logo.png";
import "./AuthScreen.css";

export type AuthTab = "login" | "signup";

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  terms: boolean;
};

export type AuthScreenProps = {
  initialTab?: AuthTab;
  loading?: boolean;
  infoMessage?: string;
  errorMessage?: string;
  onLogin: (payload: LoginPayload) => Promise<void>;
  onSignup: (payload: SignupPayload) => Promise<void>;
  onGoogle: () => Promise<void>;
  onTabChange?: (tab: AuthTab) => void;
};

type LoginErrors = Partial<Record<keyof LoginPayload, string>>;
type SignupErrors = Partial<Record<keyof SignupPayload, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const isValidEmail = (value: string) => EMAIL_REGEX.test(value.trim());

const primaryButtonClass =
  "group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-600 transition-all duration-300 hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 disabled:pointer-events-none disabled:opacity-60";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 aria-[invalid=true]:border-red-400 aria-[invalid=true]:focus:border-red-400 aria-[invalid=true]:focus:ring-red-100";

type PasswordVisibilityToggleProps = {
  isVisible: boolean;
  onToggle: () => void;
  label: string;
};

const PasswordVisibilityToggle = ({ isVisible, onToggle, label }: PasswordVisibilityToggleProps) => (
  <button
    type="button"
    onClick={onToggle}
    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
    aria-label={label}
    aria-pressed={isVisible}
  >
    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
);

const AUTH_TOGGLE_OPTIONS: Array<{ value: AuthTab; label: string }> = [
  { value: "login", label: "Entrar" },
  { value: "signup", label: "Criar conta" }
];

type AuthModeToggleProps = {
  activeTab: AuthTab;
  loading: boolean;
  onChange: (tab: AuthTab) => void;
};

const AuthModeToggle = ({ activeTab, loading, onChange }: AuthModeToggleProps) => {
  const isSignup = activeTab === "signup";

  return (
    <div
      className="auth-mode-toggle relative mb-6 grid grid-cols-2 rounded-xl border border-gray-200 bg-gray-50 p-1"
      role="tablist"
      aria-label="Acesso de conta"
      data-active={activeTab}
    >
      <span
        aria-hidden
        className={`auth-mode-toggle-slider pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/30 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          isSignup ? "translate-x-full" : "translate-x-0"
        }`}
      />
      {AUTH_TOGGLE_OPTIONS.map((option) => {
        const isActive = activeTab === option.value;

        return (
          <button
            key={option.value}
            id={`auth-${option.value}-tab`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`auth-${option.value}-panel`}
            className={`auth-mode-toggle-option relative z-10 rounded-lg px-3 py-2 text-sm font-semibold transition-[color,transform,opacity,filter] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] active:translate-y-px active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 motion-reduce:transition-none sm:px-4 sm:py-2.5 ${
              isActive
                ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => onChange(option.value)}
            disabled={loading}
          >
            <span
              className={`auth-mode-toggle-label block leading-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                isActive ? "-translate-y-px" : "translate-y-px"
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export const AuthScreen = ({
  initialTab = "login",
  loading = false,
  infoMessage,
  errorMessage,
  onLogin,
  onSignup,
  onGoogle,
  onTabChange
}: AuthScreenProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [loginData, setLoginData] = useState<LoginPayload>({
    email: "",
    password: ""
  });
  const [signupData, setSignupData] = useState<SignupPayload>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    terms: false
  });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = canvas.getContext("webgl");
    if (!gl) {
      return;
    }

    const vertexSource = `
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
    `;

    const fragmentSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform vec2 iMouse;

      void main() {
    vec2 c = (2.0 * gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
    float t = iTime * 0.08;
    vec2 mouse = 1.2 * iMouse / iResolution - 0.6;
    vec2 d = c;

    for (float i = 1.0; i < 7.0; i++) {
        d.x += 0.45 / i * cos(i * 2.1 * d.y + t);
        d.y += 0.45 / i * cos(i * 2.1 * d.x + t);
    }

    float w = abs(sin(d.x + d.y + t));
    float g = smoothstep(0.85, 0.25, w);

    vec3 base = vec3(0.02, 0.03, 0.08);
    vec3 glow = vec3(0.12, 0.30, 0.75);

    vec3 col = mix(base, glow, g * 0.2);

    // spotlight no centro
    float center = smoothstep(0.8, 0.0, length(c));
    col += glow * center * 0.25;

    gl_FragColor = vec4(col, 1.0);
}
    `;

    const compileShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) {
        return null;
      }
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertexShader || !fragmentShader) {
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    gl.useProgram(program);

    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionAttribute = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttribute);
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uMouse = gl.getUniformLocation(program, "iMouse");

    if (!uResolution || !uTime || !uMouse) {
      return;
    }

    let pointerX = 0;
    let pointerY = 0;
    let frameId = 0;
    const start = performance.now();

    const getDpr = () => Math.min(window.devicePixelRatio || 1, 2);

    const handleMouseMove = (event: MouseEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
    };

    const resize = () => {
      const dpr = getDpr();
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      const elapsed = (performance.now() - start) / 1000;
      const dpr = getDpr();

      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uMouse, pointerX * dpr, canvas.height - pointerY * dpr);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      frameId = window.requestAnimationFrame(render);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", resize);
    resize();
    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(vertexBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);

  const switchTab = (tab: AuthTab) => {
    setActiveTab(tab);
    setLoginErrors({});
    setSignupErrors({});
    onTabChange?.(tab);
  };

  const preventAnchorNavigation = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
  };

  const validateLogin = () => {
    const errors: LoginErrors = {};

    if (!loginData.email.trim()) {
      errors.email = "Informe seu e-mail.";
    } else if (!isValidEmail(loginData.email)) {
      errors.email = "Informe um e-mail valido.";
    }

    if (!loginData.password) {
      errors.password = "Informe sua senha.";
    } else if (loginData.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = "A senha precisa ter ao menos 8 caracteres.";
    }

    return errors;
  };

  const validateSignup = () => {
    const errors: SignupErrors = {};

    if (!signupData.firstName.trim()) {
      errors.firstName = "Informe seu nome.";
    }

    if (!signupData.lastName.trim()) {
      errors.lastName = "Informe seu sobrenome.";
    }

    if (!signupData.email.trim()) {
      errors.email = "Informe seu e-mail corporativo.";
    } else if (!isValidEmail(signupData.email)) {
      errors.email = "Informe um e-mail valido.";
    }

    if (!signupData.password) {
      errors.password = "Informe uma senha.";
    } else if (signupData.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = "A senha precisa ter ao menos 8 caracteres.";
    }

    if (!signupData.terms) {
      errors.terms = "Voce precisa aceitar os termos.";
    }

    return errors;
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateLogin();
    setLoginErrors(errors);

    if (Object.keys(errors).length === 0) {
      await onLogin(loginData);
    }
  };

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateSignup();
    setSignupErrors(errors);

    if (Object.keys(errors).length === 0) {
      await onSignup(signupData);
    }
  };

  return (
    <div className="auth-root">
      <canvas ref={canvasRef} id="auth-bg-canvas" aria-hidden />
      <div className="auth-grain" aria-hidden />

      <div className="auth-scene">
        <div className="w-full max-w-[31rem] rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl shadow-blue-500/10 sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-14 place-items-center sm:h-14 sm:w-16" aria-hidden>
              <Image src={aithosLoginLogo} alt="" aria-hidden className="auth-brand-icon-image" priority />
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-2xl font-bold text-transparent">
              Aithos <span>Sales</span>
            </div>
          </div>

          <AuthModeToggle activeTab={activeTab} loading={loading} onChange={switchTab} />

          {errorMessage ? (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          ) : null}
          {infoMessage ? (
            <p className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
              {infoMessage}
            </p>
          ) : null}

          <div className="auth-panels">
            <section
              id="auth-login-panel"
              role="tabpanel"
              aria-labelledby="auth-login-tab"
              aria-hidden={activeTab !== "login"}
              inert={activeTab !== "login"}
              className={`auth-panel auth-panel-login ${activeTab === "login" ? "is-active" : "is-inactive"}`}
            >
              <h1 className="mb-2 text-3xl font-bold leading-tight text-gray-900">Bem-vindo de volta.</h1>
              <p className="mb-6 text-sm leading-relaxed text-gray-600 sm:text-base">
                Acesse sua conta para continuar gerenciando suas vendas.
              </p>

              <form className="space-y-4" onSubmit={handleLoginSubmit} noValidate>
                <div>
                  <label htmlFor="auth-login-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-gray-600">
                    E-mail
                  </label>
                  <div className="group relative">
                    <svg
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    <input
                      id="auth-login-email"
                      type="email"
                      placeholder="seu@email.com"
                      autoComplete="email"
                      className={`${inputClass} pl-10`}
                      value={loginData.email}
                      aria-invalid={Boolean(loginErrors.email)}
                      onChange={(event) =>
                        setLoginData((current) => ({ ...current, email: event.target.value }))
                      }
                    />
                  </div>
                  {loginErrors.email ? <p className="mt-1.5 text-xs text-red-600">{loginErrors.email}</p> : null}
                </div>

                <div>
                  <label htmlFor="auth-login-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-gray-600">
                    Senha
                  </label>
                  <div className="group relative">
                    <svg
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors duration-200 group-focus-within:text-blue-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <input
                      id="auth-login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="********"
                      autoComplete="current-password"
                      className={`${inputClass} pl-10 pr-11`}
                      value={loginData.password}
                      aria-invalid={Boolean(loginErrors.password)}
                      onChange={(event) =>
                        setLoginData((current) => ({ ...current, password: event.target.value }))
                      }
                    />
                    <PasswordVisibilityToggle
                      isVisible={showLoginPassword}
                      onToggle={() => setShowLoginPassword((current) => !current)}
                      label={showLoginPassword ? "Ocultar senha" : "Mostrar senha"}
                    />
                  </div>
                  {loginErrors.password ? <p className="mt-1.5 text-xs text-red-600">{loginErrors.password}</p> : null}
                </div>

                <div className="flex justify-end">
                  <a href="#" onClick={preventAnchorNavigation} className="text-sm text-gray-500 transition-colors hover:text-blue-600">
                    Esqueci minha senha
                  </a>
                </div>

                <button type="submit" className={primaryButtonClass} disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                  <svg className="h-4 w-4 fill-none stroke-white" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">ou continue com</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              <button type="button" className={secondaryButtonClass} onClick={() => onGoogle()} disabled={loading}>
                <svg className="h-[1.125rem] w-[1.125rem]" viewBox="0 0 48 48" aria-hidden>
                  <path
                    fill="#FFC107"
                    d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z"
                  />
                  <path
                    fill="#4CAF50"
                    d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z"
                  />
                  <path
                    fill="#1976D2"
                    d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z"
                  />
                </svg>
                Entrar com Google
              </button>
            </section>

            <section
              id="auth-signup-panel"
              role="tabpanel"
              aria-labelledby="auth-signup-tab"
              aria-hidden={activeTab !== "signup"}
              inert={activeTab !== "signup"}
              className={`auth-panel auth-panel-signup ${activeTab === "signup" ? "is-active" : "is-inactive"}`}
            >
              <h1 className="mb-2 text-3xl font-bold leading-tight text-gray-900">Comece hoje.</h1>
              <p className="mb-6 text-sm leading-relaxed text-gray-600 sm:text-base">
                Crie sua conta e turbine suas vendas com inteligencia.
              </p>

              <form className="space-y-4" onSubmit={handleSignupSubmit} noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="auth-signup-first-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-gray-600">
                      Nome
                    </label>
                    <input
                      id="auth-signup-first-name"
                      type="text"
                      placeholder="Joao"
                      autoComplete="given-name"
                      className={inputClass}
                      value={signupData.firstName}
                      aria-invalid={Boolean(signupErrors.firstName)}
                      onChange={(event) =>
                        setSignupData((current) => ({
                          ...current,
                          firstName: event.target.value
                        }))
                      }
                    />
                    {signupErrors.firstName ? (
                      <p className="mt-1.5 text-xs text-red-600">{signupErrors.firstName}</p>
                    ) : null}
                  </div>

                  <div>
                    <label htmlFor="auth-signup-last-name" className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-gray-600">
                      Sobrenome
                    </label>
                    <input
                      id="auth-signup-last-name"
                      type="text"
                      placeholder="Silva"
                      autoComplete="family-name"
                      className={inputClass}
                      value={signupData.lastName}
                      aria-invalid={Boolean(signupErrors.lastName)}
                      onChange={(event) =>
                        setSignupData((current) => ({
                          ...current,
                          lastName: event.target.value
                        }))
                      }
                    />
                    {signupErrors.lastName ? (
                      <p className="mt-1.5 text-xs text-red-600">{signupErrors.lastName}</p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-signup-email" className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-gray-600">
                    E-mail corporativo
                  </label>
                  <input
                    id="auth-signup-email"
                    type="email"
                    placeholder="voce@empresa.com"
                    autoComplete="email"
                    className={inputClass}
                    value={signupData.email}
                    aria-invalid={Boolean(signupErrors.email)}
                    onChange={(event) =>
                      setSignupData((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                  {signupErrors.email ? <p className="mt-1.5 text-xs text-red-600">{signupErrors.email}</p> : null}
                </div>

                <div>
                  <label htmlFor="auth-signup-password" className="mb-2 block text-xs font-semibold uppercase tracking-[0.06em] text-gray-600">
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="auth-signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="Minimo 8 caracteres"
                      autoComplete="new-password"
                      className={`${inputClass} pr-11`}
                      value={signupData.password}
                      aria-invalid={Boolean(signupErrors.password)}
                      onChange={(event) =>
                        setSignupData((current) => ({
                          ...current,
                          password: event.target.value
                        }))
                      }
                    />
                    <PasswordVisibilityToggle
                      isVisible={showSignupPassword}
                      onToggle={() => setShowSignupPassword((current) => !current)}
                      label={showSignupPassword ? "Ocultar senha" : "Mostrar senha"}
                    />
                  </div>
                  {signupErrors.password ? <p className="mt-1.5 text-xs text-red-600">{signupErrors.password}</p> : null}
                </div>

                <div className="flex items-start gap-2.5">
                  <input
                    className="mt-1 h-4 w-4 accent-blue-600"
                    type="checkbox"
                    id="auth-terms"
                    checked={signupData.terms}
                    onChange={(event) =>
                      setSignupData((current) => ({ ...current, terms: event.target.checked }))
                    }
                  />
                  <label htmlFor="auth-terms" className="text-sm font-normal leading-relaxed text-gray-600">
                    Concordo com os{" "}
                    <a href="#" onClick={preventAnchorNavigation} className="font-medium text-blue-600 transition-colors hover:text-blue-700">
                      Termos de Uso
                    </a>{" "}
                    e a{" "}
                    <a href="#" onClick={preventAnchorNavigation} className="font-medium text-blue-600 transition-colors hover:text-blue-700">
                      Politica de Privacidade
                    </a>{" "}
                    da Aithos Sales.
                  </label>
                </div>
                {signupErrors.terms ? <p className="text-xs text-red-600">{signupErrors.terms}</p> : null}

                <button type="submit" className={primaryButtonClass} disabled={loading}>
                  {loading ? "Criando..." : "Criar Conta"}
                  <svg className="h-4 w-4 fill-none stroke-white" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-medium uppercase tracking-[0.08em] text-gray-400">ou cadastre com</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              <button type="button" className={secondaryButtonClass} onClick={() => onGoogle()} disabled={loading}>
                Cadastrar com Google
              </button>
            </section>
          </div>
        </div>
      </div>

      <p className="pointer-events-none fixed bottom-4 left-1/2 z-[3] -translate-x-1/2 px-4 text-center text-xs font-medium text-blue-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.75)]">
        © 2026 Aithos Sales. Todos os direitos reservados.
      </p>
    </div>
  );
};
