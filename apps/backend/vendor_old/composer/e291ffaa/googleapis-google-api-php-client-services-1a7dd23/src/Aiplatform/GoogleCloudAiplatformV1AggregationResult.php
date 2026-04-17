<?php

/*
 * Copyright 2014 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

namespace Google\Service\Aiplatform;

use Google\Model;

class GoogleCloudAiplatformV1AggregationResult extends Model
{
    /**
     * Unspecified aggregation metric.
     */
    public const AGGREGATION_METRIC_AGGREGATION_METRIC_UNSPECIFIED = 'AGGREGATION_METRIC_UNSPECIFIED';

    /**
     * Average aggregation metric. Not supported for Pairwise metric.
     */
    public const AGGREGATION_METRIC_AVERAGE = 'AVERAGE';

    /**
     * Mode aggregation metric.
     */
    public const AGGREGATION_METRIC_MODE = 'MODE';

    /**
     * Standard deviation aggregation metric. Not supported for pairwise metric.
     */
    public const AGGREGATION_METRIC_STANDARD_DEVIATION = 'STANDARD_DEVIATION';

    /**
     * Variance aggregation metric. Not supported for pairwise metric.
     */
    public const AGGREGATION_METRIC_VARIANCE = 'VARIANCE';

    /**
     * Minimum aggregation metric. Not supported for pairwise metric.
     */
    public const AGGREGATION_METRIC_MINIMUM = 'MINIMUM';

    /**
     * Maximum aggregation metric. Not supported for pairwise metric.
     */
    public const AGGREGATION_METRIC_MAXIMUM = 'MAXIMUM';

    /**
     * Median aggregation metric. Not supported for pairwise metric.
     */
    public const AGGREGATION_METRIC_MEDIAN = 'MEDIAN';

    /**
     * 90th percentile aggregation metric. Not supported for pairwise metric.
     */
    public const AGGREGATION_METRIC_PERCENTILE_P90 = 'PERCENTILE_P90';

    /**
     * 95th percentile aggregation metric. Not supported for pairwise metric.
     */
    public const AGGREGATION_METRIC_PERCENTILE_P95 = 'PERCENTILE_P95';

    /**
     * 99th percentile aggregation metric. Not supported for pairwise metric.
     */
    public const AGGREGATION_METRIC_PERCENTILE_P99 = 'PERCENTILE_P99';

    /**
     * Aggregation metric.
     *
     * @var string
     */
    public $aggregationMetric;

    protected $bleuMetricValueType = GoogleCloudAiplatformV1BleuMetricValue::class;

    protected $bleuMetricValueDataType = '';

    protected $customCodeExecutionResultType = GoogleCloudAiplatformV1CustomCodeExecutionResult::class;

    protected $customCodeExecutionResultDataType = '';

    protected $exactMatchMetricValueType = GoogleCloudAiplatformV1ExactMatchMetricValue::class;

    protected $exactMatchMetricValueDataType = '';

    protected $pairwiseMetricResultType = GoogleCloudAiplatformV1PairwiseMetricResult::class;

    protected $pairwiseMetricResultDataType = '';

    protected $pointwiseMetricResultType = GoogleCloudAiplatformV1PointwiseMetricResult::class;

    protected $pointwiseMetricResultDataType = '';

    protected $rougeMetricValueType = GoogleCloudAiplatformV1RougeMetricValue::class;

    protected $rougeMetricValueDataType = '';

    /**
     * Aggregation metric.
     *
     * Accepted values: AGGREGATION_METRIC_UNSPECIFIED, AVERAGE, MODE,
     * STANDARD_DEVIATION, VARIANCE, MINIMUM, MAXIMUM, MEDIAN, PERCENTILE_P90,
     * PERCENTILE_P95, PERCENTILE_P99
     *
     * @param  self::AGGREGATION_METRIC_*  $aggregationMetric
     */
    public function setAggregationMetric($aggregationMetric)
    {
        $this->aggregationMetric = $aggregationMetric;
    }

    /**
     * @return self::AGGREGATION_METRIC_*
     */
    public function getAggregationMetric()
    {
        return $this->aggregationMetric;
    }

    /**
     * Results for bleu metric.
     */
    public function setBleuMetricValue(GoogleCloudAiplatformV1BleuMetricValue $bleuMetricValue)
    {
        $this->bleuMetricValue = $bleuMetricValue;
    }

    /**
     * @return GoogleCloudAiplatformV1BleuMetricValue
     */
    public function getBleuMetricValue()
    {
        return $this->bleuMetricValue;
    }

    /**
     * Result for code execution metric.
     */
    public function setCustomCodeExecutionResult(GoogleCloudAiplatformV1CustomCodeExecutionResult $customCodeExecutionResult)
    {
        $this->customCodeExecutionResult = $customCodeExecutionResult;
    }

    /**
     * @return GoogleCloudAiplatformV1CustomCodeExecutionResult
     */
    public function getCustomCodeExecutionResult()
    {
        return $this->customCodeExecutionResult;
    }

    /**
     * Results for exact match metric.
     */
    public function setExactMatchMetricValue(GoogleCloudAiplatformV1ExactMatchMetricValue $exactMatchMetricValue)
    {
        $this->exactMatchMetricValue = $exactMatchMetricValue;
    }

    /**
     * @return GoogleCloudAiplatformV1ExactMatchMetricValue
     */
    public function getExactMatchMetricValue()
    {
        return $this->exactMatchMetricValue;
    }

    /**
     * Result for pairwise metric.
     */
    public function setPairwiseMetricResult(GoogleCloudAiplatformV1PairwiseMetricResult $pairwiseMetricResult)
    {
        $this->pairwiseMetricResult = $pairwiseMetricResult;
    }

    /**
     * @return GoogleCloudAiplatformV1PairwiseMetricResult
     */
    public function getPairwiseMetricResult()
    {
        return $this->pairwiseMetricResult;
    }

    /**
     * Result for pointwise metric.
     */
    public function setPointwiseMetricResult(GoogleCloudAiplatformV1PointwiseMetricResult $pointwiseMetricResult)
    {
        $this->pointwiseMetricResult = $pointwiseMetricResult;
    }

    /**
     * @return GoogleCloudAiplatformV1PointwiseMetricResult
     */
    public function getPointwiseMetricResult()
    {
        return $this->pointwiseMetricResult;
    }

    /**
     * Results for rouge metric.
     */
    public function setRougeMetricValue(GoogleCloudAiplatformV1RougeMetricValue $rougeMetricValue)
    {
        $this->rougeMetricValue = $rougeMetricValue;
    }

    /**
     * @return GoogleCloudAiplatformV1RougeMetricValue
     */
    public function getRougeMetricValue()
    {
        return $this->rougeMetricValue;
    }
}

// Adding a class alias for backwards compatibility with the previous class name.
class_alias(GoogleCloudAiplatformV1AggregationResult::class, 'Google_Service_Aiplatform_GoogleCloudAiplatformV1AggregationResult');
