import React from "react";
import { NavLink } from "react-router-dom";
import { isExternalLink } from "../../components/button/button";

interface IProfileNavigationItemProps {
  link: string;
  children: string;
}

const ProfileNavigationItem = ({
  link,
  children,
}: IProfileNavigationItemProps): JSX.Element => {
  const linkClasses = {
    default:
      "text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center px-3 py-2 text-sm font-medium rounded-md",
    active: "bg-gray-100 text-gray-900",
  };

  if (isExternalLink(link)) {
    return (
      <li>
        <a href={link} className={linkClasses.default} role="menuitem">
          <span className="truncate">{children}</span>
        </a>
      </li>
    );
  }

  return (
    <li>
      <NavLink
        to={link}
        className={linkClasses.default}
        activeClassName={linkClasses.active}
        role="menuitem"
      >
        <span className="truncate">{children}</span>
      </NavLink>
    </li>
  );
};

const ProfileNavigation = (): JSX.Element => {
  return (
    <nav className="w-full">
      <ul className="space-y-1">
        <ProfileNavigationItem link="/profile">
          Account information
        </ProfileNavigationItem>
        <ProfileNavigationItem link="/override-data">
          Override account data
        </ProfileNavigationItem>
        <ProfileNavigationItem link="/api/profile/my-data">
          Download my data
        </ProfileNavigationItem>
      </ul>
    </nav>
  );
};

export default ProfileNavigation;
