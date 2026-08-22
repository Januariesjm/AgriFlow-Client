import { render, screen, fireEvent } from "@testing-library/react"
import VendorSettingsForm from "@/components/vendor/VendorSettingsForm"

describe("VendorSettingsForm Component", () => {
  const mockProps = {
    fullName: "Jane Doe",
    onFullNameChange: jest.fn(),
    phone: "+254711223344",
    onPhoneChange: jest.fn(),
    country: "Kenya",
    onCountryChange: jest.fn(),
    region: "Nairobi",
    onRegionChange: jest.fn(),
    saving: false,
    onSave: jest.fn((e) => e.preventDefault()),
  }

  test("renders input fields with provided values", () => {
    render(<VendorSettingsForm {...mockProps} />)

    expect(screen.getByText("Representative Details")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Jane Doe")).toBeInTheDocument()
    expect(screen.getByDisplayValue("+254711223344")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Nairobi")).toBeInTheDocument()
  })

  test("triggers field change callbacks on user typing/selecting", () => {
    render(<VendorSettingsForm {...mockProps} />)

    const nameInput = screen.getByRole("textbox", { name: /full name/i })
    fireEvent.change(nameInput, { target: { value: "John Smith" } })
    expect(mockProps.onFullNameChange).toHaveBeenCalledWith("John Smith")

    const countrySelect = screen.getByRole("combobox", { name: /country/i })
    fireEvent.change(countrySelect, { target: { value: "Uganda" } })
    expect(mockProps.onCountryChange).toHaveBeenCalledWith("Uganda")
  })

  test("triggers onSave when form is submitted", () => {
    render(<VendorSettingsForm {...mockProps} />)

    const submitBtn = screen.getByRole("button", { name: /save settings/i })
    fireEvent.click(submitBtn)

    expect(mockProps.onSave).toHaveBeenCalled()
  })
})
