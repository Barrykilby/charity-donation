import {
  Banner,
  BlockStack,
  useApi,
  useTranslate,
  reactExtension,
  useApplyCartLinesChange,
  Button,
  useCartLines,
  View,
  Link,
  Pressable,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  InlineLayout,
  Heading,
  TextField,
  Style,
  Grid,
  Text,
  useSettings,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from "react";

// Donation options
const donationOptions = [
  { label: '£100', value: '100' },
  { label: '£50', value: '50' },
  { label: '£20', value: '20' }
];

export default reactExtension(
  'purchase.checkout.block.render',
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  const { query } = useApi();
  const lines = useCartLines();
  const applyCartLinesChange = useApplyCartLinesChange();

  const [donationProduct, setDonationProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState('0');
  const [customValue, setCustomValue] = useState('');
  const [giftAid, setGiftAid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cartDonationAmount, setCartDonationAmount] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const { donation_title, donation_content, giftaid_content } = useSettings();

  const title = donation_title || 'Make A Donation';
  const content = donation_content || '£10 a month could help someone join a Focus on Confident Living Outdoors course to hear about the services, equipment and aids that may be helpful for getting around. ';
  const giftaid = giftaid_content || 'Gift Aid';

  // Fetch donation product on component mount
  useEffect(() => {
    fetchDonationProduct();
  }, []);

  // Update selected value from cart lines
  useEffect(() => {
    updateSelectedValueFromCart();
  }, [lines]);

  // Fetch donation product details
  const fetchDonationProduct = async () => {
    setLoading(true);
    try {
      const { data } = await query(
        `query getProductByHandle($handle: String!) {
          product(handle: $handle) {
            id
            title
            variants(first: 1) {
              nodes {
                id
              }
            }
          }
        }`,
        { variables: { handle: "donation" } },
      );
      setDonationProduct(data.product);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Update selected value based on cart lines
  const updateSelectedValueFromCart = () => {
    const donationLines = lines.filter(line =>
      line.attributes.some(attr => attr.key === '__donation_amount')
    );

    if (donationLines.length > 0) {
      const donationAmount = donationLines.reduce((sum, line) => {
        const amount = line.attributes.find(attr => attr.key === '__donation_amount').value;
        return sum + parseFloat(amount);
      }, 0).toFixed(0);

      setCartDonationAmount(donationAmount);

      const optionValues = donationOptions.map(option => option.value);

      if (optionValues.includes(donationAmount)) {
        setSelectedValue(donationAmount);
        setCustomValue('');
      } else {
        setSelectedValue('0');
        setCustomValue(donationAmount);
      }

      setGiftAid(donationLines.some(line => line.attributes.find(attr => attr.key === 'Gift Aid').value === 'Yes'));
    } else {
      setCartDonationAmount(null);
    }
    setShowForm(false);
  };

  // Handle adding donation to cart
  const handleAddToCart = async (variantId) => {
    setBusy(true);
    const newDonationAmount = parseFloat(customValue || selectedValue);

    const donationLines = lines.filter(line =>
      line.attributes.some(attr => attr.key === '__donation_amount')
    );

    if (donationLines.length > 0) {
      const result = await applyCartLinesChange({
        type: 'updateCartLine',
        id: donationLines[0].id,
        quantity: 1,
        attributes: [
          { key: '__donation_amount', value: newDonationAmount.toFixed(2) },
          { key: 'Gift Aid', value: giftAid ? 'Yes' : 'No' },
        ],
      });

      if (result.type === 'error') {
        console.error(result.message);
      }
    } else {
      const result = await applyCartLinesChange({
        type: 'addCartLine',
        merchandiseId: variantId,
        quantity: 1,
        attributes: [
          { key: '__donation_amount', value: newDonationAmount.toFixed(0) },
          { key: 'Gift Aid', value: giftAid ? 'Yes' : 'No' },
        ],
      });

      if (result.type === 'error') {
        console.error(result.message);
      }
    }
    setBusy(false);
  };

  // Handle removing donation from cart
  const handleRemoveDonation = async () => {
    setBusy(true);
    const donationLines = lines.filter(line =>
      line.attributes.some(attr => attr.key === '__donation_amount')
    );

    if (donationLines.length > 0) {
      const result = await applyCartLinesChange({
        type: 'removeCartLine',
        id: donationLines[0].id,
        quantity: 1,
      });

      if (result.type === 'error') {
        console.error(result.message);
      }
    }
    setBusy(false);
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Banner title="Loading">
      Loading...
    </Banner>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!loading && !donationProduct) {
    return null;
  }

  if (cartDonationAmount && !showForm) {
    return (
      <BlockStack spacing="base">
        <Banner status="info" title="Thank you for your Donation." />
        <InlineLayout columns={['45%', '10%', '45%']}>  <View border="none" padding="base" blockAlignment="center">
          <Link onPress={() => setShowForm(true)}>Amend donation</Link>
        </View>
          <View border="none" padding="base" blockAlignment="center">|</View>
          <View border="none" padding="base" blockAlignment="center">
            <Link onPress={handleRemoveDonation}>Remove donation</Link>
          </View>
        </InlineLayout>
      </BlockStack>
    );
  }

  return (
    <BlockStack spacing="base">
      <BlockStack>
        <Heading level="1">{title}</Heading>
        <Banner
          status="info"
          title={content}
        />
      </BlockStack>
      <View border="none" padding="none">
        Choose an amount or enter your own:
      </View>
      <BlockStack background="none" cornerRadius="none">
        <Grid 
          columns={Style.default(['fill']).when({viewportInlineSize: {min: 'small'}}, [
            '45%',
            '10%',
            '45%',
          ])}
          rows={Style.default(['auto', 30, 'auto']).when({viewportInlineSize: {min: 'small'}}, [
            'auto',
          ])}
        >
          <View border="none" padding="none" minInlineSize="fill" inlineSize="fill">
            <ToggleButtonGroup
              label="Donation Amount"
              value={selectedValue}
              onChange={(value) => {
                setSelectedValue(value);
                setCustomValue('');
              }}
            >
              <InlineLayout spacing="base" minInlineSize="fill" inlineSize="fill">
                {donationOptions.map((option, index) => (
                  <ToggleButton
                    id={option.value.toString()}
                    key={index}
                    value={option.value}
                  >
                    <View blockAlignment="center" inlineAlignment="center" minInlineSize="fill" inlineSize="fill">
                      {option.label}
                    </View>
                  </ToggleButton>
                ))}
              </InlineLayout>
            </ToggleButtonGroup>
          </View>
          <View border="none" padding="none" blockAlignment="center" inlineAlignment="center">
            <Text size="base">or</Text>
          </View>
          <View border="none" padding="none">
            <TextField
              type="number"
              value={customValue}
              onChange={(value) => {
                setSelectedValue(value || '0');
                setCustomValue(value);
              }}
            />
          </View>
        </Grid>
      </BlockStack>
      <BlockStack>
        <Checkbox
          id="giftAid"
          name="giftAid"
          checked={giftAid}
          onChange={(value) => setGiftAid(value)}
        >
          {giftaid}
        </Checkbox>
      </BlockStack>
      <Button
        loading={busy}
        disabled={busy}
        onPress={() => handleAddToCart(donationProduct?.variants?.nodes[0]?.id)}
      >
        Donate
      </Button>
    </BlockStack>
  );
}