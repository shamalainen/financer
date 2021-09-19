import React from "react";
import { Transition } from "@headlessui/react";
import MobileNavigationItem from "./mobile-navigation.item";

interface IMobileNavigationActionsBodyProps {
  isModalHidden: boolean;
  outsideClickRef: any;
  onClick?(param: boolean): void;
}

const MobileNavigationActionsBody = ({
  isModalHidden,
  outsideClickRef,
  onClick = () => {},
}: IMobileNavigationActionsBodyProps): JSX.Element => {
  return (
    <Transition
      show={!isModalHidden}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      {(ref) => (
        <div
          className="absolute bottom-full -translate-y-3 left-0 right-0 flex justify-center"
          aria-hidden={isModalHidden}
          ref={ref}
        >
          <nav
            className="bg-white p-2 rounded-lg shadow-md whitespace-nowrap border mx-4 max-w-sm w-full"
            ref={outsideClickRef}
            aria-label="Quick transaction actions navigation in mobile viewmode."
          >
            <ul className="grid grid-cols-3 justify-center items-center">
              <MobileNavigationItem
                label="Income"
                iconName="download"
                link="/incomes/add"
                ariaLabel="Add new income transaction"
                onClick={() => onClick(true)}
              />
              <MobileNavigationItem
                label="Expense"
                iconName="upload"
                link="/expenses/add"
                ariaLabel="Add new expense transaction"
                onClick={() => onClick(true)}
              />
              <MobileNavigationItem
                label="Transfer"
                iconName="switch-horizontal"
                link="/accounts/transfer"
                ariaLabel="Add new transfer transaction"
                onClick={() => onClick(true)}
              />
            </ul>
          </nav>
        </div>
      )}
    </Transition>
  );
};

export default MobileNavigationActionsBody;
