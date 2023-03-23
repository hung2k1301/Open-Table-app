import NavBar from "./components/NavBar";
import Header from "./components/Header";
import RestaurantCard from "./components/RestaurantCard";

export default function Home() {
  return (
    <main>
      <Header></Header>
      <div className="py-3 px-36 mt-10 flex flex-wrap justify-center">
        <RestaurantCard></RestaurantCard>
      </div>
    </main>
  );
}
