import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import SignUpForm from '@/components/SignUpForm';

const Login: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-2xl">
              I
            </span>
            <span className="font-bold text-3xl text-slate-800 font-script">Itamorotinga</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-700">
            {isLoginView ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h2>
          <p className="text-sm text-slate-500">
            {isLoginView ? 'Faça login para continuar' : 'Junte-se à comunidade'}
          </p>
        </div>
        
        {isLoginView ? <LoginForm /> : <SignUpForm />}

        <p className="text-sm text-center text-slate-500">
          {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
          <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-primary hover:underline">
            {isLoginView ? 'Cadastre-se' : 'Faça login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;