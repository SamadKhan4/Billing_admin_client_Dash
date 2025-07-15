import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-yellow-100 to-yellow-300 text-black backdrop-blur shadow-md sticky top-0 z-50 px-4 py-3 py-4 text-center shadow-md backdrop-blur">
      <p className="text-sm leading-relaxed">
        Created By <span className="font-semibold">Ritesh Ramtekkar</span> <br />
        Under the Guidance of <br />
        <a
          href="https://www.agarkarmedia.com"
          target="_blank"
          rel="noreferrer"
          className="underline text-black hover:text-yellow-600 transition font-medium"
        >
          AgarkarMedia Pvt. Ltd.
        </a> <br />
        &copy; 2023 - 2024, All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
