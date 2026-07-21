import { PoolBooking, ScrollToTop } from '../components';

/**
  * Home page displaying only the PoolBooking hero section.
  */
export default function Home() {
  return (
    <div>
      <ScrollToTop />
      <PoolBooking />
    </div>
  );
}
