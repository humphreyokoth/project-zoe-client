import React, { useState, useEffect } from 'react';
import * as yup from "yup";
import { reqDate, reqObject, reqString } from "../../data/validations";
// import {ministryCategories} from "../../data/comboCategories";
import { FormikHelpers } from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import XDateInput from "../../components/inputs/XTimeInput";
import XSelectInput from "../../components/inputs/XSelectInput";
import { toOptions } from "../../components/inputs/inputHelpers";

import { remoteRoutes } from "../../data/constants";
import { useDispatch } from 'react-redux';
import { servicesConstants } from "../../data/teamlead/reducer";
import { post, put } from "../../utils/ajax";
import Toast from "../../utils/Toast";
import { XRemoteSelect } from "../../components/inputs/XRemoteSelect";
import { Box, TextField } from "@material-ui/core";
import { ICreateDayDto, ISaveToATT, ISaveToUTT } from "./types";
import { isoDateString } from "../../utils/dateHelpers";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Header from "./Header";
import { owners } from '../../data/teamlead/tasks';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import { enumToArray } from "../../utils/stringHelpers";

import { ministryCategories } from "../../data/comboCategories";
import Autocomplete from '@material-ui/lab/Autocomplete';

interface IProps {
    data: any | null
    done?: () => any

}

const schema = yup.object().shape(
    {
        taskId: reqObject,
        startDate: reqDate,
        endDate: reqDate,
        taskInfo: reqString,
        userId: reqObject,


    }
)

const initialValues = {

    taskId: '',
    startDate: '',
    endDate: '',
    taskInfo: '',
    userId: null,

}

const RightPadded = ({ children, ...props }: any) => <Grid item xs={6}>
    <Box pr={1} {...props}>
        {children}
    </Box>
</Grid>

const LeftPadded = ({ children, ...props }: any) => <Grid item xs={6}>
    <Box pl={1} {...props}>
        {children}
    </Box>
</Grid>


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
            maxWidth: 300,
        },
        root: {
            flexGrow: 1,
        },
        filterPaper: {
            borderRadius: 0,
            padding: theme.spacing(2)
        },
        fab: {
            position: 'absolute',
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
    }),
);

const AssignTask = ({ done }: IProps) => {
    const dispatch = useDispatch();
    const classes = useStyles();

    function appointmentTasks(values: any, actions: any, id: any) {
        const toSaveAppointmentTaskTable: ISaveToATT = {
            appointmentId: id,
            taskId: values.taskId.value,
        }

        post(remoteRoutes.appointmentTask, toSaveAppointmentTaskTable,
            (data) => {

                userTask(values, actions, data.id)
            },
            undefined,
            () => {
                actions.setSubmitting(false);

            }
        )
    }

    function userTask(values: any, actions: any, id: any) {
        const toSaveUserTaskTable: ISaveToUTT = {
            appointmentTaskId: id,
            userId: values.userId.value,
        }

        post(remoteRoutes.userTask, toSaveUserTaskTable,
            (data) => {
                Toast.info('Operation successful')
                actions.resetForm()
                dispatch({
                    type: servicesConstants.servicesAddDay,
                    payload: { ...data },
                })
                if (done)
                    done()
            },
            undefined,
            () => {
                actions.setSubmitting(false);

            }
        )

    }

    function handleSubmit(values: any, actions: FormikHelpers<any>) {

        const toSave: ICreateDayDto = {
            startDate: values.startDate,
            endDate: values.endDate,
            taskInfo: values.taskInfo,

        }
        post(remoteRoutes.appointments, toSave,
            (data) => {
                console.log(data, data.id)
                appointmentTasks(values, actions, data.id);
            },
            undefined,
            () => {
                actions.setSubmitting(false);

            }

        )






    }





    // enum TeamPrivacy {
    //     Sweeping = "sweeping",
    //     Mopping = "mopping",
    //     Coaching = "coaching",
    //     Arranging = "Arranging church",

    // }

    const [persons, setPersons] = useState<any>({id: 0, contactId: 0, listOfPersons: []});
    useEffect(() => {
        const fetchPersons = async () => {
            const result = await fetch(remoteRoutes.contactsPerson).then(
                response => response.json()
            )
            setPersons({
                ...persons,
                listOfPersons: result
            });
        }
        fetchPersons();
    }, []);

    const handleChange = (value: any) => {
        const fetchEmail = async () => {
            const fetchedEmail = await fetch(remoteRoutes.contactsEmail + "/" + value.id).then(
                response => response.json()
            )

            setPersons({
                ...persons,
                id: value.id,
                email: fetchedEmail.value,
                contactId: fetchedEmail.contactId,
            });
        }
        fetchEmail();
    }

    return (

        <Box p={1} className={classes.root}>
            <Header title="Assign Volunteers Task" />

            <Grid item xs={6}>
                <XForm
                    onSubmit={handleSubmit}
                    schema={schema}
                    initialValues={initialValues}
                >
                    <Grid spacing={0} container>
                        <Grid item xs={12}>
                            {/* <XSelectInput
                                name="taskId"
                                label="Task Name"
                                // options={toOptions(enumToArray(TeamPrivacy))}
                                options={toOptions(ministryCategories)}
                                variant='outlined'
                            /> */}
                            <XRemoteSelect
                                remote={remoteRoutes.tasks}
                                filter={{ 'taskName[]': '' }}
                                parser={({ taskName, id }: any) => ({ label: taskName, value: id })}
                                name="taskId"
                                label="Task Name"
                                variant='outlined'
                            />
                        </Grid>
                        <RightPadded>
                            <XDateInput
                                name="startDate"
                                label="Start Date"

                            />
                        </RightPadded>
                        <LeftPadded>
                            <XDateInput
                                name="endDate"
                                label="End Date"

                            />
                        </LeftPadded>
                        <Grid item xs={12}>
                            <XTextInput
                                name="taskInfo"
                                label="Task Details"
                                type="text"
                                variant='outlined'
                            />
                        </Grid>

                        <Grid item xs={12}>
                            { <XRemoteSelect
                            remote={remoteRoutes.contactsPerson}
                            filter={{'firstName[]': 'Volunteer'}}
                            parser={({firstName, id}: any) => ({label: firstName, value: id})}
                            name="userId"
                            label="Volunteers"
                            variant='outlined'
                            /> }

                            {/*<Autocomplete
                                multiple
                                id="free-solo-demo"
                                freeSolo
                                options={persons.listOfPersons}
                                getOptionLabel={(option) => option.firstName + " " + option.lastName}
                                onChange={(event: any, value: any) => handleChange(value)} // prints the selected value
                                renderInput={(params) => (
                                <TextField {...params} label="Search for person to add as Volunteer" margin="normal" variant="outlined" />
                                )}
                            /> */}

                            {/*<Autocomplete

                                multiple
                                // limitTags={2}
                                id="multiple-limit-tags"
                                options={top100Films}
                                getOptionLabel={(option) => option.title}
                                defaultValue={[top100Films[13], top100Films[12], top100Films[11]]}
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" label="limitTags" placeholder="Favorites" />
                                )}
                            /> */}
                        </Grid>
                    </Grid>

                </XForm>
            </Grid>
        </Box>




    );
}




export default AssignTask;