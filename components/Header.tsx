import Link from "next/link";
import Image from "next/image";
import Navitems from "./NavItems";
import UserDropdown from "./UserDropdown";

const Header = () => {
  return (
    <header className="sticky top-0 header">
      <div className=" container header-wrapper">
        <Link href="/">
          <Image
            src="assets/icons/logo.svg"
            alt="Signalist Logo"
            width={140}
            height={32}
            className="h-8 w-auto cursor-pointer"
          />
        </Link>
        <nav className="hidden sm:block">
          {/* Navitems */}
          <Navitems />
        </nav>
        {/* User Dropdown */}
        <UserDropdown />
      </div>
    </header>
  );
};

export default Header;
