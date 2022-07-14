import { Card } from "@blueprintjs/core";
import { TagColours } from "@portal/constants/annotation";
import React from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Legend,
  Line,
  TooltipProps,
  ReferenceLine,
  XAxis
} from "recharts";
import {
  ValueType,
  NameType,
} from 'recharts/src/component/DefaultTooltipContent';

export const NoData = () => <p>No data to analyze yet. Click the analyze button ('A') to infer data.</p>

export const UnrecognizedDataError = ({ dataType }: { dataType: string }) => {
  return (
    <p>
      Unrecognized data type ({dataType})
      <br />
      <a href="https://github.com/datature/portal/issues"
        style={{ userSelect: "none", minWidth: "max-content" }}
        className={"bp3-button bp3-minimal"}
      >
        Report this issue.
      </a>
    </p>
  )
}


const getInitialCountRecord = (tagNames: string[]) => {
  const countRecord: Record<string, number> = {}
  for (const tagName of tagNames) {
    countRecord[tagName] = 0
  }
  return countRecord
}


export type FrameItemCounts = { frameKey: string; itemCounts: Record<string, number>; }

/* 
------------------
getFrameItemCounts
------------------
Returns an array of object where each object contains the frameKey 
and a record called `itemCounts` which is a map of the tag name, and number of items in 
that frame per tag. 

example return: 
  [
    { frameKey: "123", itemCounts: { person: 4, bus: 8 } }
    { frameKey: "400", itemCounts: { person: 11, bus: 0 } }
  ]

  when:
    tags = { bus: some_number, person: another_number}
    Object.keys(frames) = ['123', '400']
*/
export const getFrameItemCounts = ({ tags, confidenceThreshold, frames }: {
  tags: Record<string, number>,
  confidenceThreshold: number,
  frames: Record<number, { confidence: number, tag: { name: string, id: number } }[]>
}) => {

  const noItemCounts = getInitialCountRecord(Object.keys(tags))

  return Object.keys(frames).map(frameKey => {
    const itemCounts: Record<string, number> = { ...noItemCounts }

    const items = frames[Number(frameKey)]
      .filter((frame) => frame.confidence >= confidenceThreshold)
      .map((frame) => frame.tag)

    for (const item of items) {
      itemCounts[item.name] = itemCounts[item.name] + 1
    }

    return { frameKey, itemCounts }
  })
}

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length >= 1) {

    const frameKey = payload[0].payload.frameKey

    // TODO: Move css styles to a classes
    return (
      <Card style={{ padding: 0, margin: 0 }}>
        <ul style={{ padding: '10px 20px' }}>
          {payload?.map(item => {
            return <li key={item.dataKey} style={{ color: item.color }}>
              {item.name} : {item.value}
            </li>
          })}
          <li>({"0:0"}{frameKey / 1000})</li>
        </ul>
      </Card>
    )
  }

  return null
}

const CustomizedAxisTick = ({ x, y, payload }: { x: number, y: number, payload: { value: number } }) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={8} textAnchor="end" fill="#666" fontSize={8}>
        {"0:0"}{payload.value / 1000}
      </text>
    </g>
  );
}

export const VideoAnalyticsBar = (
  { currentFrameKey,
    frameItemCounts,
    tagIdMap,
    graphType,
    callback
  }: {
    currentFrameKey: string,
    frameItemCounts: FrameItemCounts[],
    tagIdMap: Record<string, number>,
    graphType?: 'graph-1' | 'graph-2',
    callback?: (n: number) => void
  }) => {
  const flatData = frameItemCounts.map(frame => { return { frameKey: frame.frameKey, ...frame.itemCounts } })
  const tagNames = Object.keys(tagIdMap)

  const ContainerComponent = graphType === 'graph-1' ? LineChart : AreaChart
  const ChildComponent = (graphType === 'graph-1' ? Line : Area) as React.ComponentClass<
    { key: string, type: string, dataKey: string, stroke: string, strokeWidth: number, fill: string, stackId?: string }>

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ContainerComponent data={flatData}
        margin={{ left: 0, right: 0, top: 0, bottom: -12 }}
        onClick={(e) => {
          const frameKey = e?.activePayload?.[0]?.payload?.frameKey
          if (frameKey && !isNaN(Number(frameKey)))
            callback?.(Number(frameKey))
        }}
      >
        <CartesianGrid strokeDasharray="1 5" />
        <Tooltip content={<CustomTooltip />} />
        <XAxis dataKey={"frameKey"} tick={(props) => <CustomizedAxisTick {...props} />} />
        <Legend layout="vertical" verticalAlign="top" align="left" />
        {tagNames.map((tagName) => {
          const color = TagColours[tagIdMap[tagName] % TagColours.length]
          return (
            <ChildComponent
              key={tagName}
              type="curveLinear"
              dataKey={tagName}
              stroke={color}
              strokeWidth={2}
              fill={color}
              stackId="1"

            />
          )
        })}
        <ReferenceLine x={currentFrameKey} strokeWidth={4} stroke={"red"} />
      </ContainerComponent>
    </ResponsiveContainer>
  );
}


export const ImageAnalyticsBar = (
  { data, tagIdMap, graphType }:
    {
      data: any,
      tagIdMap: Record<string, number>,
      graphType?: 'graph-1' | 'graph-2'
    }) => {
  console.log("image analytics", data, tagIdMap, graphType)
  return <div style={{ background: graphType === 'graph-1' ? "green" : "red", width: "100%" }}>Image: {graphType}</div>

}




