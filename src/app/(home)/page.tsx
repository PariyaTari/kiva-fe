import "./_styles/home.css";
import HomeView from "./_components/homeView/homeView";

/** Home — design `index.html`. */
export default function HomePage() {
	return (
		<div className="pg-home">
			<main>
				<HomeView />
			</main>
		</div>
	);
}
