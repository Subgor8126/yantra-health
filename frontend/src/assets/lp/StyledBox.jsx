import { styled } from '@mui/material/styles';

const StyledBox = styled('div')(({ theme }) => ({
    alignSelf: 'center',
    width: '100%',
    height: 400,
    marginTop: theme.spacing(8),
    borderRadius: (theme.vars || theme).shape.borderRadius,
    outline: '6px solid',
    outlineColor: 'hsla(220, 25%, 80%, 0.2)',
    border: '1px solid',
    borderColor: (theme.vars || theme).palette.grey[200],
    boxShadow: '0 0 12px 8px hsla(220, 25%, 80%, 0.2)',
    backgroundImage: `https://mui.com/static/screenshots/material-ui/getting-started/templates/dashboard.jpg)`,
    backgroundSize: 'cover',
    [theme.breakpoints.up('sm')]: {
      marginTop: theme.spacing(10),
      height: 700,
    },
    ...theme.applyStyles('dark', {
      boxShadow: '0 0 24px 12px hsla(210, 100%, 25%, 0.2)',
      backgroundImage: `https://mui.com/static/screenshots/material-ui/getting-started/templates/dashboard-dark.jpg)`,
      outlineColor: 'hsla(220, 20%, 42%, 0.1)',
      borderColor: (theme.vars || theme).palette.grey[700],
    }),
  }));

  export default StyledBox;