
import "./components/index.css";
import Spline from '@splinetool/react-spline';
import Header from "./components/header"

export default function App() {
  return (
    <div className="flex w-full h-screen flex-col items-center">
      <div className="absolute w-full h-screen">
        <Spline scene="https://prod.spline.design/vhzK73kG-fnMjSXS/scene.splinecode" />
      </div>
      {/* <div className="w-full max-w-[1150px]">
        <Header />
      </div> */}
    </div>
  );
}
