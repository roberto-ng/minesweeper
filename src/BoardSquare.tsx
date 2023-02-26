import Icon from '@mdi/react';
import { mdiMine, mdiFlag } from '@mdi/js';
import {
  BoardSquareT,
  countMinesAround,
  GameBoard,
  SquareState,
  Vector2,
} from './gameState';
import { match, P } from 'ts-pattern';
import cx from 'classnames';
import { useEffect, useMemo, useRef } from 'react';

type Props = {
  pos: Vector2;
  board: GameBoard;
  square: BoardSquareT;
  onRightClick?: () => void;
  onClick?: () => void;
};

export function BoardSquare({
  pos,
  board,
  square,
  onRightClick,
  onClick,
}: Props) {
  const squareRef = useRef<HTMLDivElement>(null);
  const iconColor = !square.isVisible ? 'white' : '#a3e635';

  useEffect(() => {
    const handleRightClick = (e: Event) => {
      e.preventDefault();

      if (onRightClick != null) {
        onRightClick();
      }
    };

    squareRef.current?.addEventListener('contextmenu', handleRightClick);
    return () => {
      squareRef.current?.removeEventListener('contextmenu', handleRightClick);
    };
  }, []);

  const minesAround = useMemo(() => {
    return square.isVisible ? countMinesAround(pos, board) : null;
  }, [square.isVisible]);

  return (
    <div
      ref={squareRef}
      onClick={onClick}
      className={cx(
        'w-8',
        'h-8',
        'flex',
        'justify-center',
        'items-center',
        'border-[1px]',
        'border-lime-300',
        {
          'cursor-pointer': !square.isVisible,
          'bg-lime-400': !square.isVisible,
          'bg-white': square.isVisible,
          'hover:bg-lime-500': !square.isVisible,
          'hover:bg-stone-200': square.isVisible,
        }
      )}
    >
      {match(square)
        .with({ hasFlag: true, isVisible: false }, () => (
          <Icon path={mdiFlag} size={1} color={iconColor} />
        ))
        .with({ state: SquareState.Mine, isVisible: true }, () => (
          <Icon path={mdiMine} size={1} color={iconColor} />
        ))
        .with({ state: SquareState.Empty, isVisible: true }, () => (
          <p className="text-lime-400 font-bold text-3xl select-none">
            {minesAround == 0 ? '' : minesAround}
          </p>
        ))
        .otherwise(() => (
          <div />
        ))}
    </div>
  );
}
