import React from 'react';
import * as yup from "yup";
import {reqDate, reqEmail, reqString} from "../../data/validations";
import {genderCategories,ageCategories} from "../../data/comboCategories";
import {FormikActions} from "formik";
import Grid from "@material-ui/core/Grid";
import XForm from "../../components/forms/XForm";
import XTextInput from "../../components/inputs/XTextInput";
import XDateInput from "../../components/inputs/XDateInput";
import XSelectInput from "../../components/inputs/XSelectInput";
import {XRemoteSelect, ISelectOpt} from "../../components/inputs/XRemoteSelect";
import {toOptions} from "../../components/inputs/inputHelpers";

import {remoteRoutes} from "../../data/constants";
import {useDispatch} from 'react-redux'
import {crmConstants} from "../../data/contacts/reducer";
import {post} from "../../utils/ajax";
import Toast from "../../utils/Toast";
import XRadioInput from "../../components/inputs/XRadioInput";
import {Box} from "@material-ui/core";

interface IProps {
    data: any | null
    done?: () => any
}

const schema = yup.object().shape(
    {
        firstName: reqString,
        lastName: reqString,
        gender: reqString,
        dateOfBirth: reqDate,
        phone: reqString,
    }
)

const NewContactForm = ({data, done}: IProps) => {
    const dispatch = useDispatch();

    function handleSubmit(values: any, actions: FormikActions<any>) {
        const toSave = {
            category: 'Person',
            person: {
                firstName: values.firstName,
                middleName: values.middleName,
                lastName: values.lastName,
                dateOfBirth: values.dateOfBirth,
                gender: values.gender,
                ageGroup: values.ageGroup,
                placeOfWork: values.placeOfWork,
                cellGroupId: values.cellGroup.id,
                churchLocationId: values.churchLocation.id,
            },
            phones: [
                {
                    category: 'Mobile',
                    isPrimary: true,
                    value: values.phone
                }
            ],
            emails: [
                {
                    category: 'Personal',
                    isPrimary: true,
                    value: values.email
                }
            ],
            addresses: [
                {
                    category: 'Home',
                    isPrimary: false,
                    country: 'Uganda',
                    district: 'Kampala',
                    county: '-NA-',
                    freeForm: values.residence
                }
            ],
            identifications: [],
            events: []
        }
        post(remoteRoutes.contacts, toSave,
            (data) => {
                Toast.info('Operation successful')
                actions.resetForm()
                dispatch({
                    type: crmConstants.crmAddContact,
                    payload: {...data},
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

    return (
        <XForm
            onSubmit={handleSubmit}
            schema={schema}
            initialValues={data}
        >
            <Grid spacing={1} container>
                <Grid item xs={6}>
                    <XTextInput
                        name="firstName"
                        label="First Name"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XTextInput
                        name="lastName"
                        label="Last Name"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="middleName"
                        label="Other Names"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <Box pt={3}>
                        <XRadioInput
                            name="gender"
                            label="Gender"
                            options={toOptions(genderCategories)}
                        />
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <XDateInput
                        name="dateOfBirth"
                        label="Date of Birth"
                        inputVariant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XSelectInput
                        name="ageGroup"
                        label="Age"
                        options={toOptions(ageCategories)}
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="phone"
                        label="Phone"
                        type="text"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={12}>
                    <XTextInput
                        name="email"
                        label="Email"
                        type="email"
                        variant='outlined'
                    />
                </Grid>
                <Grid item xs={6}>
                    <XRemoteSelect
                        remote={remoteRoutes.groupsLocationCombo}
                        filter={{category:'Location'}}
                        parser={({name, id}: any) => ({label: name, id})}
                        name="churchLocation"
                        label="Church Location"
                    />
                </Grid>
                <Grid item xs={6}>
                    <XRemoteSelect
                        remote={remoteRoutes.groupsLocationCombo}
                        filter={{category:'MC'}}
                        parser={({name, id}: any) => ({label: name, id})}
                        name="cellGroup"
                        label="Missional Community"
                    />
                </Grid>             
                <Grid item xs={12}>
                    <XRemoteSelect
                        name="workplace"
                        label="Workplace"
                        remote={remoteRoutes.contactsPerson}
                        parser={({id, name}: any): ISelectOpt => ({id, label: name})}
                    />                
                </Grid>                
                <Grid item xs={12}>
                    <XRemoteSelect
                        name="residence"
                        label="Residence"
                        remote={remoteRoutes.contactsPerson}
                        parser={({id, name}: any): ISelectOpt => ({id, label: name})}
                    />                   
                </Grid>                                                                                         
            </Grid>
        </XForm>
    );
}


export default NewContactForm;
