import SvgIcon from "@mui/material/SvgIcon";

function XrayIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M12 2C10.3 2 9 3.3 9 5s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3zm5.5 4c.8 0 1.5.7 1.5 1.5V9h-3V7.5c0-.8.7-1.5 1.5-1.5zM6 6.5C6 5.7 6.7 5 7.5 5S9 5.7 9 6.5V9H6V6.5zM5 10h14c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2h-3v-2h3v-2h-3v-2h3v-2H5v2h3v2H5v2h3v2H5c-1.1 0-2-.9-2-2v-7c0-1.1.9-2 2-2zM10 19h4v2h-4v-2zm1-4h2v2h-2v-2zm0-3h2v2h-2v-2z"/>
    </SvgIcon>
  );
}

export {XrayIcon}