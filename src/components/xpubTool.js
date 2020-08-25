import React, { useState, useMemo } from "react"
import { Alert, Row, Col, Form } from "react-bootstrap"
import { MAINNET, validateExtendedPublicKey } from "unchained-bitcoin"
import { EXAMPLE_XPUBS, EXAMPLE_TPUBS } from "../components/xpubExamples"
import DerivedAddressesTable from "../components/derivedAddressesTable.js"
import { accountDerivationPath } from "../lib/paths.js"
import { Purpose } from "../lib/xpub.js"

const MAX_ACCOUNTS = 25

const XPubTool = props => {
  const exampleXPub =
    props.network === MAINNET ? EXAMPLE_XPUBS[0] : EXAMPLE_TPUBS[0]

  const [xpub, setXpub] = useState(exampleXPub)
  const [purpose, setPurpose] = useState(Purpose.P2SH) // default to 3addresses
  const [accountNumber, setAccountNumber] = useState(0)
  const [addressCount, setAddressCount] = useState(5)

  // derived state. gets cached and recomputed by `useMemo` whenever `xpub` or `props.network` change
  const isValidXpub = useMemo(
    () => validateExtendedPublicKey(xpub, props.network) === "",
    [xpub, props.network]
  )

  const handleXpubChange = event => setXpub(event.target.value)
  const handlePurposeChange = event => setPurpose(event.target.value)
  const handleAccountNumberChange = event =>
    setAccountNumber(event.target.value)
  const handleAddressCountChange = event => setAddressCount(event.target.value)

  let accountList = []
  for (var i = 0; i < MAX_ACCOUNTS; i++) {
    accountList.push(<option key={i}>{i}</option>)
  }

  return (
    <div>
      <Form>
        <Form.Group>
          <Form.Control
            size="lg"
            type="text"
            placeholder="xpub..."
            value={xpub}
            onChange={handleXpubChange}
          />
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm="2">
            BIP
          </Form.Label>
          <Col sm="10">
            <Form.Control
              as="select"
              size="sm"
              name="purpose"
              value={purpose}
              onChange={handlePurposeChange}
            >
              {Object.values(Purpose).map(type => (
                <option key={type}>{type}</option>
              ))}
            </Form.Control>
          </Col>
        </Form.Group>
        <Form.Group as={Row}>
          <Form.Label column sm="2">
            Account Nr.
          </Form.Label>
          <Col sm="10">
            <Form.Control
              as="select"
              size="sm"
              name="accountNumber"
              value={accountNumber}
              onChange={handleAccountNumberChange}
            >
              {accountList}
            </Form.Control>
          </Col>
          <Form.Label column sm="2">
            Stacking Time
          </Form.Label>
          <Col sm="10">
            <Form.Control
              type="range"
              name="addressCount"
              min="1"
              max="99"
              value={addressCount}
              onChange={handleAddressCountChange}
            />
          </Col>
        </Form.Group>
      </Form>
      <p>
        <code>{accountDerivationPath(purpose, accountNumber)}/i</code>
      </p>
      {isValidXpub ? (
        <DerivedAddressesTable
          network={props.network}
          xpub={xpub}
          purpose={purpose}
          addressCount={addressCount}
          accountNumber={accountNumber}
        />
      ) : (
        <Alert variant="warning">Invalid xPub</Alert>
      )}
    </div>
  )
}

export default XPubTool
