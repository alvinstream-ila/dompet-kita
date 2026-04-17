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

class GoogleCloudAiplatformV1DeleteFeatureValuesRequest extends Model
{
    protected $selectEntityType = GoogleCloudAiplatformV1DeleteFeatureValuesRequestSelectEntity::class;

    protected $selectEntityDataType = '';

    protected $selectTimeRangeAndFeatureType = GoogleCloudAiplatformV1DeleteFeatureValuesRequestSelectTimeRangeAndFeature::class;

    protected $selectTimeRangeAndFeatureDataType = '';

    /**
     * Select feature values to be deleted by specifying entities.
     */
    public function setSelectEntity(GoogleCloudAiplatformV1DeleteFeatureValuesRequestSelectEntity $selectEntity)
    {
        $this->selectEntity = $selectEntity;
    }

    /**
     * @return GoogleCloudAiplatformV1DeleteFeatureValuesRequestSelectEntity
     */
    public function getSelectEntity()
    {
        return $this->selectEntity;
    }

    /**
     * Select feature values to be deleted by specifying time range and features.
     */
    public function setSelectTimeRangeAndFeature(GoogleCloudAiplatformV1DeleteFeatureValuesRequestSelectTimeRangeAndFeature $selectTimeRangeAndFeature)
    {
        $this->selectTimeRangeAndFeature = $selectTimeRangeAndFeature;
    }

    /**
     * @return GoogleCloudAiplatformV1DeleteFeatureValuesRequestSelectTimeRangeAndFeature
     */
    public function getSelectTimeRangeAndFeature()
    {
        return $this->selectTimeRangeAndFeature;
    }
}

// Adding a class alias for backwards compatibility with the previous class name.
class_alias(GoogleCloudAiplatformV1DeleteFeatureValuesRequest::class, 'Google_Service_Aiplatform_GoogleCloudAiplatformV1DeleteFeatureValuesRequest');
