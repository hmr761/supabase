import { CSSProperties, FC, memo } from 'react'
import memoize from 'memoize-one'
import { areEqual, VariableSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import InfiniteLoader from 'react-window-infinite-loader'

import { propsAreEqual } from 'lib/helpers'
import ShimmeringLoader from 'components/ui/ShimmeringLoader'

/**
 * Note that the loading more logic of this component works best with a cursor-based
 * pagination API such that each payload response from the API returns a structure like
 * { cursor, items, hasNext, hasPrevious }
 */

const createItemData = memoize((items, itemProps) => ({ items, ...itemProps }))

interface ItemProps {
  data: any
  index: number
  style: CSSProperties
}

const Item: FC<ItemProps> = memo(({ data, index, style }) => {
  const { items, itemProps, ItemComponent } = data
  const item = items[index]

  return item ? (
    <div style={style}>
      <ItemComponent index={index} item={item} {...itemProps} />
    </div>
  ) : (
    <div className="space-y-1 my-1" style={style}>
      <ShimmeringLoader />
      <ShimmeringLoader />
      <ShimmeringLoader />
    </div>
  )
}, areEqual)

const InfiniteList = ({
  items = [],
  itemProps = {},
  hasNextPage = false,
  isLoadingNextPage = false,
  getItemSize = () => 40,
  onLoadNextPage = () => {},
  ItemComponent = () => null,
}) => {
  // Only load 1 page of items at a time
  // Pass an empty callback to InfiniteLoader in case it asks to load more than once
  const loadMoreItems = isLoadingNextPage ? () => {} : onLoadNextPage

  // Every row is loaded except for our loading indicator row
  const isItemLoaded = (index: number) => !hasNextPage || !!items[index]

  const itemCount = hasNextPage ? items.length + 1 : items.length
  const itemData = createItemData(items, { itemProps, ItemComponent })

  return (
    <div className="relative flex flex-col flex-grow">
      <div className="flex-grow">
        <AutoSizer>
          {({ height, width }) => (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              loadMoreItems={loadMoreItems}
            >
              {({ onItemsRendered, ref }) => (
                <VariableSizeList
                  ref={ref}
                  height={height}
                  width={width}
                  itemCount={itemCount}
                  itemData={itemData}
                  itemSize={getItemSize}
                  onItemsRendered={onItemsRendered}
                >
                  {Item}
                </VariableSizeList>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          pointerEvents: 'none', //https://github.com/bvaughn/react-window/issues/455
        }}
      />
    </div>
  )
}

export default memo(InfiniteList, propsAreEqual)
