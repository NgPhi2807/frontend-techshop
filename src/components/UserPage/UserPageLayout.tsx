// File: src/components/UserPage/UserAccountLayout.tsx

import React from 'react';
import Navigation from './Navigation';



interface UserAccountLayoutProps {
  breadcrumbTitle: string;
  children: React.ReactNode;
}

const UserAccountLayout: React.FC<UserAccountLayoutProps> = ({
  breadcrumbTitle,
  children,
}) => {

  const Breadcrumb: React.FC<{ title: string }> = ({ title }) => (
    <nav
      className="mx-auto w-full max-w-screen-xl text-sm text-gray-500 pb-4"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        <li>
          <a href="/" className="text-blue-600 transition font-medium">
            Trang chủ
          </a>
        </li>
        <li className="text-gray-400">/</li>
        <li className="text-gray-800 font-semibold">{title}</li>
      </ol>
    </nav>
  );


  return (
    <div className="w-full py-4 max-w-screen-xl mx-auto px-2 2xl:px-0 relative">
      
      <Breadcrumb title={breadcrumbTitle} />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full gap-4 lg:w-[25%]">
          <Navigation />
        </div>

        <div className="w-full gap-4 lg:w-[75%]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserAccountLayout;