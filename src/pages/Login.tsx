import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import SignUpForm from '@/components/SignUpForm';

const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  const title = isLoginView ? 'Bem-vindo de volta!' : 'Junte-se à comunidade';
  const subtitle = isLoginView ? 'Faça login para continuar' : 'Crie sua conta e comece a fazer a diferença';

  const Logo = ({ isWhite = false }: { isWhite?: boolean }) => (
    <div className="flex items-center space-x-3">
      <img src="/logo-itamorotinga.png" alt="Itamorotinga Logo" className={`w-10 h-10 ${isWhite ? 'brightness-0 invert' : ''}`} />
      <div className="flex flex-col items-start">
        <span className={`font-bold text-3xl font-script ${isWhite ? 'text-white' : 'text-slate-800'}`}>Itamorotinga</span>
        <img src="/serra-da-logo-itamorotinga.png" alt="Serra de Itamorotinga" className={`h-3 w-full object-contain -mt-1 ${isWhite ? 'brightness-0 invert' : ''}`} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Coluna de Marketing/Boas-vindas (Esquerda) */}
        <div className="md:w-1/2 bg-primary-600 p-8 md:p-12 text-white flex flex-col justify-center space-y-6">
          <Logo isWhite={true} />
          <h2 className="text-3xl font-bold leading-snug">
            Sua voz, o futuro da nossa cidade.
          </h2>
          <p className="text-primary-100 text-lg">
            Compartilhe ideias, contribua com projetos e ajude a construir a Itamorotinga que você sempre sonhou.
          </p>
          <ul className="space-y-3 text-primary-100">
            <li className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Proponha ideias diretamente aos gestores.</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Vote e contribua nas propostas da comunidade.</span>
            </li>
            <li className="flex items-center space-x-2">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>Acompanhe o progresso das iniciativas.</span>
            </li>
          </ul>
        </div>

        {/* Coluna de Formulário (Direita) */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-4 md:hidden">
              <Logo />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <p className="text-md text-slate-500 mt-1">{subtitle}</p>
          </div>
          
          {isLoginView ? <LoginForm /> : <SignUpForm />}

          <p className="text-sm text-center text-slate-500 mt-6">
            {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-primary hover:underline">
              {isLoginView ? 'Cadastre-se' : 'Faça login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;