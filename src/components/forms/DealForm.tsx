'use client';

/**
 * Deal input form with react-hook-form and zod validation
 */

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useCallback } from 'react';
import {
  dealFormSchema,
  defaultDealValues,
  getDealWarnings,
  type DealFormValues,
} from '@/lib/validations/deal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { PropertyLookupResponse } from '@/app/api/property-lookup/route';
import { PRESET_MARKET_TAGS } from '@/types/deal';

// Human-readable labels for preset tags
const MARKET_TAG_LABELS: Record<string, string> = {
  bay_area_appreciation: 'Bay Area / Appreciation',
  cash_flow_market: 'Cash Flow Market',
  midwest_value: 'Midwest Value',
  sunbelt_growth: 'Sunbelt Growth',
  coastal_premium: 'Coastal Premium',
  college_town: 'College Town',
  vacation_rental: 'Vacation Rental',
};

interface DealFormProps {
  initialValues?: Partial<DealFormValues>;
  onSubmit: (values: DealFormValues) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function DealForm({
  initialValues,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Deal',
}: DealFormProps) {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupInfo, setLookupInfo] = useState<{
    source: string;
    rentRange?: { low: number; high: number };
    lastSale?: { price: number; date: string };
  } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(dealFormSchema),
    defaultValues: { ...defaultDealValues, ...initialValues } as DealFormValues,
  });

  // Property lookup function
  const handlePropertyLookup = useCallback(async () => {
    const address = getValues('address');
    const city = getValues('city');
    const state = getValues('state');
    const zip = getValues('zip');

    // Build full address for lookup
    const fullAddress = [address, city, state, zip].filter(Boolean).join(', ');

    if (!fullAddress || fullAddress.length < 10) {
      setLookupError('Please enter an address to lookup');
      return;
    }

    setIsLookingUp(true);
    setLookupError(null);
    setLookupInfo(null);

    try {
      const response = await fetch(`/api/property-lookup?address=${encodeURIComponent(fullAddress)}`);
      const result: PropertyLookupResponse = await response.json();

      if (!result.success || !result.data) {
        setLookupError(result.error || 'Property not found');
        return;
      }

      const data = result.data;

      // Populate form fields
      if (data.address) setValue('address', data.address);
      if (data.city) setValue('city', data.city);
      if (data.state) setValue('state', data.state);
      if (data.zip) setValue('zip', data.zip);
      if (data.propertyType) setValue('propertyType', data.propertyType);
      if (data.beds) setValue('beds', data.beds);
      if (data.baths) setValue('baths', data.baths);
      if (data.sqft) setValue('sqft', data.sqft);
      if (data.yearBuilt) setValue('yearBuilt', data.yearBuilt);
      if (data.purchasePrice) setValue('purchasePrice', data.purchasePrice);
      if (data.monthlyRent) setValue('monthlyRent', data.monthlyRent);
      if (data.propertyTaxAnnual) setValue('propertyTaxAnnual', data.propertyTaxAnnual);

      // Store lookup metadata for display
      setLookupInfo({
        source: data.source,
        rentRange: data.rentRangeLow && data.rentRangeHigh
          ? { low: data.rentRangeLow, high: data.rentRangeHigh }
          : undefined,
        lastSale: data.lastSalePrice && data.lastSaleDate
          ? { price: data.lastSalePrice, date: data.lastSaleDate }
          : undefined,
      });
    } catch (err) {
      setLookupError('Failed to lookup property. Please try again.');
      console.error('Property lookup error:', err);
    } finally {
      setIsLookingUp(false);
    }
  }, [getValues, setValue]);

  // Watch specific fields for warnings (debounced)
  const purchasePrice = watch('purchasePrice') as number | undefined;
  const monthlyRent = watch('monthlyRent') as number | undefined;
  const appreciationPct = watch('appreciationPct') as number | undefined;
  const vacancyPct = watch('vacancyPct') as number | undefined;
  const interestRate = watch('interestRate') as number | undefined;
  const downPaymentPct = watch('downPaymentPct') as number | undefined;
  const isARM = watch('isARM') as boolean | undefined;

  // Update warnings when relevant fields change
  useEffect(() => {
    const newWarnings = getDealWarnings({
      purchasePrice,
      monthlyRent,
      appreciationPct,
      vacancyPct,
      interestRate,
      downPaymentPct,
    });
    setWarnings(newWarnings);
  }, [purchasePrice, monthlyRent, appreciationPct, vacancyPct, interestRate, downPaymentPct]);

  const handleFormSubmit = useCallback(
    handleSubmit(async (values) => {
      await onSubmit(values);
    }),
    [handleSubmit, onSubmit]
  );

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert>
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning, i) => (
                <li key={i} className="text-amber-700">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>Basic information about the property. Enter an address and click Lookup to auto-fill.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="address">Address *</Label>
            <div className="flex gap-2">
              <Input id="address" {...register('address')} placeholder="123 Main St, San Francisco, CA 94102" className="flex-1" />
              <Button
                type="button"
                variant="outline"
                onClick={handlePropertyLookup}
                disabled={isLookingUp}
              >
                {isLookingUp ? 'Looking up...' : 'Lookup'}
              </Button>
            </div>
            {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address.message}</p>}
            {lookupError && <p className="text-sm text-red-500 mt-1">{lookupError}</p>}
            {lookupInfo && (
              <div className="text-sm mt-1 space-y-1">
                <p className="text-green-600">Data loaded from {lookupInfo.source} - please verify and correct if needed</p>
                {lookupInfo.rentRange && (
                  <p className="text-gray-500">
                    Rent estimate range: ${lookupInfo.rentRange.low.toLocaleString()} - ${lookupInfo.rentRange.high.toLocaleString()}/mo
                  </p>
                )}
                {lookupInfo.lastSale && (
                  <p className="text-gray-500">
                    Last sold: ${lookupInfo.lastSale.price.toLocaleString()} on {lookupInfo.lastSale.date}
                  </p>
                )}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input id="city" {...register('city')} placeholder="San Francisco" />
            {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="state">State *</Label>
              <Input id="state" {...register('state')} placeholder="CA" maxLength={2} />
              {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state.message}</p>}
            </div>
            <div>
              <Label htmlFor="zip">ZIP *</Label>
              <Input id="zip" {...register('zip')} placeholder="94102" />
              {errors.zip && <p className="text-sm text-red-500 mt-1">{errors.zip.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="marketTag">Market Tag *</Label>
            <Controller
              name="marketTag"
              control={control}
              render={({ field }) => {
                const isCustomValue = field.value && !PRESET_MARKET_TAGS.includes(field.value as typeof PRESET_MARKET_TAGS[number]);
                return (
                  <div className="space-y-2">
                    <Select
                      value={isCustomValue ? '__custom__' : field.value}
                      onValueChange={(val) => {
                        if (val !== '__custom__') {
                          field.onChange(val);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select market tag" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRESET_MARKET_TAGS.map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {MARKET_TAG_LABELS[tag] || tag}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">Custom Tag...</SelectItem>
                      </SelectContent>
                    </Select>
                    {(isCustomValue || field.value === '__custom__') && (
                      <Input
                        placeholder="Enter custom tag (e.g., my_market)"
                        value={isCustomValue ? field.value : ''}
                        onChange={(e) => field.onChange(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      />
                    )}
                  </div>
                );
              }}
            />
            {errors.marketTag && <p className="text-sm text-red-500 mt-1">{errors.marketTag.message}</p>}
          </div>
          <div>
            <Label htmlFor="propertyType">Property Type *</Label>
            <Controller
              name="propertyType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sfh">Single Family Home</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="multi_2_4">Multi-family (2-4 units)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <Label htmlFor="beds">Beds</Label>
            <Input id="beds" type="number" {...register('beds')} placeholder="3" />
          </div>
          <div>
            <Label htmlFor="baths">Baths</Label>
            <Input id="baths" type="number" step="0.5" {...register('baths')} placeholder="2" />
          </div>
          <div>
            <Label htmlFor="sqft">Square Feet</Label>
            <Input id="sqft" type="number" {...register('sqft')} placeholder="1500" />
          </div>
          <div>
            <Label htmlFor="yearBuilt">Year Built</Label>
            <Input id="yearBuilt" type="number" {...register('yearBuilt')} placeholder="1990" />
          </div>
        </CardContent>
      </Card>

      {/* Purchase */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase</CardTitle>
          <CardDescription>Purchase price and closing costs</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="purchasePrice">Purchase Price *</Label>
            <Input
              id="purchasePrice"
              type="number"
              {...register('purchasePrice')}
              placeholder="500000"
            />
            {errors.purchasePrice && <p className="text-sm text-red-500 mt-1">{errors.purchasePrice.message}</p>}
          </div>
          <div>
            <Label htmlFor="closingCostsPct">Closing Costs (%)</Label>
            <Input
              id="closingCostsPct"
              type="number"
              step="0.001"
              {...register('closingCostsPct')}
              placeholder="0.02"
            />
            <p className="text-xs text-gray-500 mt-1">As decimal (0.02 = 2%)</p>
          </div>
        </CardContent>
      </Card>

      {/* Financing */}
      <Card>
        <CardHeader>
          <CardTitle>Financing</CardTitle>
          <CardDescription>Loan terms and down payment</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="downPaymentPct">Down Payment (%)</Label>
            <Input
              id="downPaymentPct"
              type="number"
              step="0.01"
              {...register('downPaymentPct')}
              placeholder="0.25"
            />
            <p className="text-xs text-gray-500 mt-1">As decimal (0.25 = 25%)</p>
          </div>
          <div>
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.001"
              {...register('interestRate')}
              placeholder="0.06"
            />
            <p className="text-xs text-gray-500 mt-1">As decimal (0.06 = 6%)</p>
          </div>
          <div>
            <Label htmlFor="loanTermYears">Loan Term (years)</Label>
            <Input
              id="loanTermYears"
              type="number"
              {...register('loanTermYears')}
              placeholder="30"
            />
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="isARM"
              {...register('isARM')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isARM" className="font-normal">Adjustable Rate Mortgage (ARM)</Label>
          </div>
          {isARM && (
            <>
              <div>
                <Label htmlFor="armAdjustYear">ARM Adjust Year</Label>
                <Input
                  id="armAdjustYear"
                  type="number"
                  {...register('armAdjustYear')}
                  placeholder="5"
                />
              </div>
              <div>
                <Label htmlFor="armAdjustRate">ARM Adjust Rate</Label>
                <Input
                  id="armAdjustRate"
                  type="number"
                  step="0.001"
                  {...register('armAdjustRate')}
                  placeholder="0.07"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Income */}
      <Card>
        <CardHeader>
          <CardTitle>Income</CardTitle>
          <CardDescription>Rental income and growth assumptions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="monthlyRent">Monthly Rent *</Label>
            <Input
              id="monthlyRent"
              type="number"
              {...register('monthlyRent')}
              placeholder="3000"
            />
            {errors.monthlyRent && <p className="text-sm text-red-500 mt-1">{errors.monthlyRent.message}</p>}
          </div>
          <div>
            <Label htmlFor="vacancyPct">Vacancy Rate (%)</Label>
            <Input
              id="vacancyPct"
              type="number"
              step="0.01"
              {...register('vacancyPct')}
              placeholder="0.05"
            />
            <p className="text-xs text-gray-500 mt-1">As decimal (0.05 = 5%)</p>
          </div>
          <div>
            <Label htmlFor="rentGrowthPct">Annual Rent Growth (%)</Label>
            <Input
              id="rentGrowthPct"
              type="number"
              step="0.01"
              {...register('rentGrowthPct')}
              placeholder="0.03"
            />
            <p className="text-xs text-gray-500 mt-1">As decimal (0.03 = 3%)</p>
          </div>
        </CardContent>
      </Card>

      {/* Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>Operating expenses and reserves</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="propertyTaxAnnual">Annual Property Tax</Label>
            <Input
              id="propertyTaxAnnual"
              type="number"
              {...register('propertyTaxAnnual')}
              placeholder="6000"
            />
          </div>
          <div>
            <Label htmlFor="insuranceAnnual">Annual Insurance</Label>
            <Input
              id="insuranceAnnual"
              type="number"
              {...register('insuranceAnnual')}
              placeholder="1500"
            />
          </div>
          <div>
            <Label htmlFor="hoaMonthly">Monthly HOA</Label>
            <Input
              id="hoaMonthly"
              type="number"
              {...register('hoaMonthly')}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="utilitiesMonthly">Monthly Utilities (if owner-paid)</Label>
            <Input
              id="utilitiesMonthly"
              type="number"
              {...register('utilitiesMonthly')}
              placeholder="0"
            />
          </div>
          <div>
            <Label htmlFor="managementPct">Management Fee (%)</Label>
            <Input
              id="managementPct"
              type="number"
              step="0.01"
              {...register('managementPct')}
              placeholder="0.08"
            />
            <p className="text-xs text-gray-500 mt-1">% of gross rent</p>
          </div>
          <div>
            <Label htmlFor="repairsPct">Repairs Reserve (%)</Label>
            <Input
              id="repairsPct"
              type="number"
              step="0.01"
              {...register('repairsPct')}
              placeholder="0.05"
            />
            <p className="text-xs text-gray-500 mt-1">% of gross rent</p>
          </div>
          <div>
            <Label htmlFor="capexPct">CapEx Reserve (%)</Label>
            <Input
              id="capexPct"
              type="number"
              step="0.01"
              {...register('capexPct')}
              placeholder="0.05"
            />
            <p className="text-xs text-gray-500 mt-1">% of gross rent</p>
          </div>
        </CardContent>
      </Card>

      {/* Exit */}
      <Card>
        <CardHeader>
          <CardTitle>Exit Assumptions</CardTitle>
          <CardDescription>Appreciation and selling costs</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="appreciationPct">Annual Appreciation (%)</Label>
            <Input
              id="appreciationPct"
              type="number"
              step="0.01"
              {...register('appreciationPct')}
              placeholder="0.03"
            />
            <p className="text-xs text-gray-500 mt-1">As decimal (0.03 = 3%)</p>
          </div>
          <div>
            <Label htmlFor="sellingCostsPct">Selling Costs (%)</Label>
            <Input
              id="sellingCostsPct"
              type="number"
              step="0.01"
              {...register('sellingCostsPct')}
              placeholder="0.07"
            />
            <p className="text-xs text-gray-500 mt-1">Agent + transfer tax + closing</p>
          </div>
        </CardContent>
      </Card>

      {/* Constraints */}
      <Card>
        <CardHeader>
          <CardTitle>Constraints & Notes</CardTitle>
          <CardDescription>Restrictions and known issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isRentControlled"
              {...register('isRentControlled')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isRentControlled" className="font-normal">
              Property is rent controlled
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasHOARentalLimit"
              {...register('hasHOARentalLimit')}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="hasHOARentalLimit" className="font-normal">
              HOA has rental restrictions
            </Label>
          </div>
          <div>
            <Label htmlFor="knownCapex">Known CapEx Issues</Label>
            <textarea
              id="knownCapex"
              {...register('knownCapex')}
              className="w-full mt-1 p-2 border rounded-md text-sm"
              rows={3}
              placeholder="e.g., Roof needs replacement in 5 years, HVAC is 15 years old..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
