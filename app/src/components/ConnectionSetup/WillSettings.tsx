import * as React from 'react'
import { memo, useCallback } from 'react'
import Undo from '@mui/icons-material/Undo'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Button, Grid, TextField, Typography } from '@mui/material'
import { Theme } from '@mui/material/styles'
import { withStyles } from '@mui/styles'
import { MqttWill, QoS } from 'mqtt-explorer-backend/src/DataSource/MqttSource'
import { connectionManagerActions } from '../../actions'
import { ConnectionOptions, getWillPayloadError, getWillTopicError } from '../../model/ConnectionOptions'
import { QosSelect } from '../QosSelect'
import { ToggleSwitch } from './ToggleSwitch'

interface Props {
  connection: ConnectionOptions
  classes: any
  managerActions: typeof connectionManagerActions
}

const defaultWill: MqttWill = {
  topic: '',
  payload: '',
  qos: 0,
  retain: false,
}

const WillSettings = memo((props: Props) => {
  const { classes, connection, managerActions } = props
  const { id: connectionId, will } = connection

  const toggleEnabled = useCallback(() => {
    managerActions.updateConnection(connectionId, {
      will: will ? undefined : { ...defaultWill },
    })
  }, [connectionId, managerActions, will])

  const updateWill = useCallback(
    (changeSet: Partial<MqttWill>) => {
      if (!will) {
        return
      }
      managerActions.updateConnection(connectionId, {
        will: {
          ...will,
          ...changeSet,
        },
      })
    },
    [connectionId, managerActions, will]
  )

  const updateTopic = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => updateWill({ topic: event.target.value }),
    [updateWill]
  )
  const updatePayload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => updateWill({ payload: event.target.value }),
    [updateWill]
  )
  const updateQos = useCallback((qos: QoS) => updateWill({ qos }), [updateWill])
  const toggleRetain = useCallback(() => updateWill({ retain: !will?.retain }), [updateWill, will?.retain])

  const topicError = getWillTopicError(will)
  const payloadError = getWillPayloadError(will)

  return (
    <div>
      <form noValidate autoComplete="off">
        <Grid container columnSpacing={3} rowSpacing={2} className={classes.formGrid}>
          <Grid size={12}>
            <Typography variant="subtitle1">Last Will and Testament</Typography>
            <Typography variant="body2" color="textSecondary">
              The broker publishes this message when the connection ends unexpectedly.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }} className={classes.switchCell}>
            <ToggleSwitch label="Enabled" classes={classes} value={Boolean(will)} toggle={toggleEnabled} />
          </Grid>
          {will ? (
            <>
              <Grid size={{ xs: 12, sm: 7 }}>
                <TextField
                  className={classes.fullWidth}
                  label="Topic"
                  margin="normal"
                  value={will.topic}
                  onChange={updateTopic}
                  error={Boolean(topicError)}
                  helperText={topicError || 'Publish topic; wildcards are not allowed'}
                  required
                  inputProps={{
                    'data-testid': 'last-will-topic-input',
                    'aria-label': 'Last Will topic',
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 2 }}>
                <div className={classes.qos}>
                  <QosSelect label="QoS" selected={will.qos} onChange={updateQos} />
                </div>
              </Grid>
              <Grid size={{ xs: 12, sm: 9 }}>
                <TextField
                  className={classes.fullWidth}
                  label="Payload"
                  margin="normal"
                  value={will.payload}
                  onChange={updatePayload}
                  error={Boolean(payloadError)}
                  helperText={payloadError}
                  multiline
                  minRows={2}
                  inputProps={{
                    'data-testid': 'last-will-payload-input',
                    'aria-label': 'Last Will payload',
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }} className={classes.switchCell}>
                <ToggleSwitch label="Retain" classes={classes} value={will.retain} toggle={toggleRetain} />
              </Grid>
            </>
          ) : (
            <Grid size={{ xs: 12, sm: 9 }} className={classes.disabledMessage}>
              <Typography variant="body2" color="textSecondary">
                Enable Last Will to configure its topic, payload, QoS, and retain flag.
              </Typography>
            </Grid>
          )}
          <Grid size={12} className={classes.actionRow}>
            <Button
              variant="contained"
              className={classes.button}
              onClick={managerActions.toggleWillSettings}
              data-testid="last-will-back-button"
            >
              <Undo /> Back
            </Button>
          </Grid>
        </Grid>
      </form>
    </div>
  )
})

const mapDispatchToProps = (dispatch: any) => ({
  managerActions: bindActionCreators(connectionManagerActions, dispatch),
})

const styles = (theme: Theme) => ({
  formGrid: {
    boxSizing: 'border-box' as const,
    padding: theme.spacing(0, 1.5),
  },
  fullWidth: {
    width: '100%',
  },
  switchCell: {
    display: 'flex',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      justifyContent: 'flex-start',
    },
  },
  disabledMessage: {
    alignSelf: 'center' as const,
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    marginTop: theme.spacing(1),
  },
  qos: {
    marginTop: theme.spacing(1),
  },
  switch: {
    marginTop: theme.spacing(1),
  },
})

export default connect(undefined, mapDispatchToProps)(withStyles(styles)(WillSettings) as any)
