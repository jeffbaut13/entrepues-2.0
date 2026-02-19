import { useState } from "react";
import Video360Component from "../../components/Video360/Video360";

const Video360Page = () => {
  const [visibleIndex, setVisibleIndex] = useState(6);

  return (
    <Video360Component
      visibleIndex={visibleIndex}
      setVisibleIndex={setVisibleIndex}
    />
  );
};

export default Video360Page;
