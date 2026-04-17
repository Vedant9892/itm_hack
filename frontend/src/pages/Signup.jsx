import { Link } from 'react-router-dom';

const Signup = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Sign Up</h1>
        <form className="space-y-5">
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              type="text"
              placeholder=""
              className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email address
            <input
              type="email"
              placeholder=""
              className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              type="password"
              placeholder="Create a password"
              className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            />
          </label>
          <button type="submit" className="btn-primary w-full py-3 text-sm font-semibold">
            Sign Up
          </button>
        </form>
        <p className="text-sm text-slate-500 mt-6 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-primary font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
