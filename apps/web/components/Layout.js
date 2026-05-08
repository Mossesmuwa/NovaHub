import Navbar from './Navbar';
import Footer from './Footer';
import Toast from './Toast';

export default function Layout({ children, activePage, hideFooter }) {
  return (
    <>
      <Navbar activePage={activePage} />
      <main className="page-content">{children}</main>
      {!hideFooter && <Footer />}
      <Toast />
    </>
  );
}
