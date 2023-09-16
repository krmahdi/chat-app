import { formatRecentDate } from '../../utils/helperFuncs';
import { Typography } from '@material-ui/core';
import { useChatListStyles } from '../../styles/muiStyles';
import { truncateString } from '../../utils/helperFuncs';

const LatestMessage = ({ body, type }) => {
  const classes = useChatListStyles();

  if (!body) {
    // Handle the case where 'body' is null or undefined
    return null; // or some other fallback
  }

  return (
    <div className={classes.chatInfo}>
      <div className={classes.nameAndDate}>
        <Typography variant="subtitle1" noWrap>
          {type === 'user' && body.username
            ? truncateString(body.username, 14)
            : body.name
            ? truncateString(body.name, 14)
            : 'Unknown Name'} {/* Provide a default value */}
        </Typography>
        {body.latestMessage && (
          <Typography variant="caption" className={classes.greyText}>
            {formatRecentDate(body.latestMessage.createdAt)}
          </Typography>
        )}
      </div>
      {body.latestMessage && (
        <Typography variant="subtitle2" className={classes.greyText}>
          {truncateString(body.latestMessage.body, 35)}
        </Typography>
      )}
    </div>
  );
};

export default LatestMessage;

