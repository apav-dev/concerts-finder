import { CollapsibleLabelProps } from '@yext/answers-react-components/lib/components/Filters/CollapsibleLabel';
import { useFilterGroupContext } from '@yext/answers-react-components/lib/components/Filters/FilterGroupContext';
import classNames from 'classnames';
import { BiCaretUpCircle } from 'react-icons/bi';

export function MapFilterCollapsibleLabel({ label }: CollapsibleLabelProps): JSX.Element {
  const { isExpanded, getToggleProps } = useFilterGroupContext();
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
