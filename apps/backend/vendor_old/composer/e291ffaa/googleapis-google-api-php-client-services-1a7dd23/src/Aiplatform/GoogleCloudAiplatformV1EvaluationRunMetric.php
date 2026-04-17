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

class GoogleCloudAiplatformV1EvaluationRunMetric extends Model
{
    protected $computationBasedMetricSpecType = GoogleCloudAiplatformV1EvaluationRunMetricComputationBasedMetricSpec::class;

    protected $computationBasedMetricSpecDataType = '';

    protected $llmBasedMetricSpecType = GoogleCloudAiplatformV1EvaluationRunMetricLLMBasedMetricSpec::class;

    protected $llmBasedMetricSpecDataType = '';

    /**
     * Required. The name of the metric.
     *
     * @var string
     */
    public $metric;

    protected $metricConfigType = GoogleCloudAiplatformV1Metric::class;

    protected $metricConfigDataType = '';

    /**
     * Optional. The resource name of the metric definition.
     *
     * @var string
     */
    public $metricResourceName;

    protected $predefinedMetricSpecType = GoogleCloudAiplatformV1EvaluationRunMetricPredefinedMetricSpec::class;

    protected $predefinedMetricSpecDataType = '';

    protected $rubricBasedMetricSpecType = GoogleCloudAiplatformV1EvaluationRunMetricRubricBasedMetricSpec::class;

    protected $rubricBasedMetricSpecDataType = '';

    /**
     * Spec for a computation based metric.
     */
    public function setComputationBasedMetricSpec(GoogleCloudAiplatformV1EvaluationRunMetricComputationBasedMetricSpec $computationBasedMetricSpec)
    {
        $this->computationBasedMetricSpec = $computationBasedMetricSpec;
    }

    /**
     * @return GoogleCloudAiplatformV1EvaluationRunMetricComputationBasedMetricSpec
     */
    public function getComputationBasedMetricSpec()
    {
        return $this->computationBasedMetricSpec;
    }

    /**
     * Spec for an LLM based metric.
     */
    public function setLlmBasedMetricSpec(GoogleCloudAiplatformV1EvaluationRunMetricLLMBasedMetricSpec $llmBasedMetricSpec)
    {
        $this->llmBasedMetricSpec = $llmBasedMetricSpec;
    }

    /**
     * @return GoogleCloudAiplatformV1EvaluationRunMetricLLMBasedMetricSpec
     */
    public function getLlmBasedMetricSpec()
    {
        return $this->llmBasedMetricSpec;
    }

    /**
     * Required. The name of the metric.
     *
     * @param  string  $metric
     */
    public function setMetric($metric)
    {
        $this->metric = $metric;
    }

    /**
     * @return string
     */
    public function getMetric()
    {
        return $this->metric;
    }

    /**
     * The metric config.
     */
    public function setMetricConfig(GoogleCloudAiplatformV1Metric $metricConfig)
    {
        $this->metricConfig = $metricConfig;
    }

    /**
     * @return GoogleCloudAiplatformV1Metric
     */
    public function getMetricConfig()
    {
        return $this->metricConfig;
    }

    /**
     * Optional. The resource name of the metric definition.
     *
     * @param  string  $metricResourceName
     */
    public function setMetricResourceName($metricResourceName)
    {
        $this->metricResourceName = $metricResourceName;
    }

    /**
     * @return string
     */
    public function getMetricResourceName()
    {
        return $this->metricResourceName;
    }

    /**
     * Spec for a pre-defined metric.
     */
    public function setPredefinedMetricSpec(GoogleCloudAiplatformV1EvaluationRunMetricPredefinedMetricSpec $predefinedMetricSpec)
    {
        $this->predefinedMetricSpec = $predefinedMetricSpec;
    }

    /**
     * @return GoogleCloudAiplatformV1EvaluationRunMetricPredefinedMetricSpec
     */
    public function getPredefinedMetricSpec()
    {
        return $this->predefinedMetricSpec;
    }

    /**
     * Spec for rubric based metric.
     */
    public function setRubricBasedMetricSpec(GoogleCloudAiplatformV1EvaluationRunMetricRubricBasedMetricSpec $rubricBasedMetricSpec)
    {
        $this->rubricBasedMetricSpec = $rubricBasedMetricSpec;
    }

    /**
     * @return GoogleCloudAiplatformV1EvaluationRunMetricRubricBasedMetricSpec
     */
    public function getRubricBasedMetricSpec()
    {
        return $this->rubricBasedMetricSpec;
    }
}

// Adding a class alias for backwards compatibility with the previous class name.
class_alias(GoogleCloudAiplatformV1EvaluationRunMetric::class, 'Google_Service_Aiplatform_GoogleCloudAiplatformV1EvaluationRunMetric');
