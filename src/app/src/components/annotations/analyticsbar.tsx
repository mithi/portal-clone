import React from "react";

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


export const VideoAnalyticsBar = ({ currentFrameKey, frameItemCounts, tagIdMap }: { currentFrameKey: string, frameItemCounts: FrameItemCounts[], tagIdMap: Record<string, number> }) => {
  console.log("frameItemCounts", frameItemCounts)
  return <div style={{ background: "red", width: "100%" }}>Video! {currentFrameKey}</div>

}

export const ImageAnalyticsBar = (props: { data: any, tagIdMap: Record<string, number> }) => {
  console.log("image analytics", props)
  return <div style={{ background: "green", width: "100%" }}>Image</div>

}




