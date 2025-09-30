import Input from './Input'
import CustomSelect from './Select'
import DatePicker from './DatePicker'

const FormikControl = (props) => {
    const { control, ...rest } = props
    switch (control) {
        case 'input': return <Input {...rest} />
        case 'select': return <CustomSelect {...rest} />
        case 'datePicker': return <DatePicker {...rest}/>
        default: return null
    }
}

export default FormikControl