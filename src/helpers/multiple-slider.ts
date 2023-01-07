// range slider
import noUiSlider, { target } from 'nouislider';

export type RangeSliderParams = {
  parentEl: HTMLElement;
  sliderSelector: string;
  textPrefix: string;
  minValue: number;
  maxValue: number;
  startValue: number;
  endValue: number;
  callback?: () => void;
};

export default function rangeSliderInit({
  parentEl,
  sliderSelector,
  textPrefix,
  minValue,
  maxValue,
  startValue,
  endValue,
  callback,
}: RangeSliderParams) {
  const range = parentEl.querySelector(sliderSelector) as target;
  const inputMin = range.querySelector('.input__min') as HTMLInputElement;
  const inputMax = range.querySelector('.input__max') as HTMLInputElement;
  const inputs: Array<HTMLInputElement> = [inputMin, inputMax];
  noUiSlider.cssClasses.target += ' range-slider';
  noUiSlider.create(range, {
    start: [startValue, endValue],
    connect: true,
    range: {
      min: minValue,
      max: maxValue,
    },
    padding: 2,
    step: 1,
    tooltips: {
      to: function (num) {
        return textPrefix + num.toFixed(0);
      },
    },
    format: {
      to: function (value: number): number {
        return value;
      },
      from: function (value) {
        return parseInt(value);
      },
    },
  });

  range.noUiSlider?.on('change', function (values: (number | string)[], handleNumber: number) {
    console.log(values);
    inputs[handleNumber].value = Number(values[handleNumber]).toFixed(0);
    if (callback) callback();
  });

  // inputMin.addEventListener('change', function () {
  //   range.noUiSlider?.set([this.value, '']);
  // });

  // inputMax.addEventListener('change', function () {
  //   range.noUiSlider?.set(['', this.value]);
  // });
}
