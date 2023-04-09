import Header from "./components/Header";

export default function Loading() {
  return (
    <main>
      <Header />
      <div className=" px-36 mt-10 flex flex-wrap justify-center">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
          <div
            className="animate-pulse bg-slate-900 w-64 h-72 rounded overflow-hidden border cursor-pointer"
            key={num}
          ></div>
        ))}
      </div>
    </main>
  );
}
