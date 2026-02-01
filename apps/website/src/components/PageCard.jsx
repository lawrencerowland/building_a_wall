export default function PageCard({ children }) {
  return (
    <div className="rounded-xl shadow-sm bg-white p-6 hover:shadow-md transition">
      {children}
    </div>
  );
}
