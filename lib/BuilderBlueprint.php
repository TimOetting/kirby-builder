<?php

namespace KirbyBuilder\Builder;

use Kirby\Cms\Blueprint;
use Exception;
use Kirby\Data\Data;
use Kirby\Toolkit\A;

/**
 * @author    Tim Ötting
 */
class BuilderBlueprint extends Blueprint
{
    /**
     * Extends the props with props from a given
     * mixin, when an extends key is set or the
     * props is just a string
     *
     * @param array|string $props
     * @return array
     */
    public static function extend($props): array
    {
        if (is_string($props) === true) {
            $props = [
                'extends' => $props
            ];
        }

        $extends = $props['extends'] ?? null;

        if ($extends === null) {
            return $props;
        }

        $mixin = static::find($extends);

        if ($mixin === null) {
            $props = $props;
        } elseif (is_array($mixin) === true) {
            $props = A::merge($mixin, $props, A::MERGE_REPLACE);
        } else {
            try {
                $propsFromExtension = Data::read($mixin);
                $props = A::merge($propsFromExtension, $props, A::MERGE_REPLACE);
                if (array_key_exists("extends", $propsFromExtension)) {
                    $props["extends"] = $propsFromExtension["extends"];
                }
            } catch (Exception $e) {
                $props = $props;
            }
        }

        // remove the extends flag
        if ($extends === $props['extends']) {
            unset($props['extends']);
        } else {
            $props = static::extend($props);
        }
        return $props;
    }
}