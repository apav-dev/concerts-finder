import { Filters } from '@yext/answers-react-components';
import classNames from 'classnames';
import { BiCaretUpCircle } from 'react-icons/bi';

interface MapFilterCollapsibleLabelProps {
  label: string;
}

export function MapFilterCollapsibleLabel({ label }: MapFilterCollapsibleLabelProps): JSX.Element {
  const { isExpanded, getToggleProps } = Filters.useFilterGroupContext();
  const iconClassName = classNames('w-6', {
    'transform rotate-180': !isExpanded,
  });

  return (
    <button
      className="h-11 px-2 w-full flex justify-between items-center rounded-md bg-cardGray"
      {...getToggleProps()}
    >
      <div className="text-sm font-medium text-left">{label}</div>
      <BiCaretUpCircle className={iconClassName} />
    </button>
  );
}
