import React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";

interface PencilIconProps extends SvgProps {
  size?: number;
  color?: string;
}

const PencilIcon: React.FC<PencilIconProps> = ({
  size = 24,
  color = "black",
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M16.086 2.586a2 2 0 012.828 0l3.5 3.5a2 2 0 010 2.828l-10 10A2 2 0 0112.586 19H7a1 1 0 01-1-1v-5.586a2 2 0 01.586-1.414l10-10z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default PencilIcon;
