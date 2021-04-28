import React from "react";

export type TAddiotinalLabel = {
  label: string;
  accentLabel?: string;
};

interface IProps {
  label: string;
  addiotinalLabel?: TAddiotinalLabel;
}

const StackedListHeader = ({ label, addiotinalLabel }: IProps): JSX.Element => {
  return (
    <div className="flex flex-col shadow-md lg:shadow-none p-6 bg-gray-800 sticky top-4 lg:flex-shrink-0 lg:w-80 lg:mr-6 space-y-6 mb-4">
      <h2 className="text-xl font-bold tracking-tight leading-none truncate text-white">
        {label}
      </h2>
      {addiotinalLabel && (
        <h3 className="text-lg tracking-tigh leading-none flex-shrink-0 inline-flex justify-between text-white">
          {addiotinalLabel.accentLabel && (
            <>
              <span className="truncate">{addiotinalLabel.accentLabel}</span>
            </>
          )}
          {addiotinalLabel.label}
        </h3>
      )}
    </div>
  );
};

export default StackedListHeader;
